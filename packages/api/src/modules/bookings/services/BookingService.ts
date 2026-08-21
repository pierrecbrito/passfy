import { prisma } from '../../../core/database/prisma';
import { AppError } from '../../../core/errors/AppError';
import { CryptoProvider } from '../../../core/security/cryptoProvider';
import { SocketService } from '../../../core/websocket/socketServer';
import { StripePaymentService, StripePaymentResult } from '../../payments/services/StripePaymentService';
import { CheckoutInput, AttendeeInput } from '../dtos/bookingSchemas';
import { TicketStatus, ReservationStatus, Ticket, Seat, Event, Prisma } from '@prisma/client';
import crypto from 'crypto';

export interface TicketTier {
  id?: string;
  name?: string;
  price?: number | string;
  description?: string;
  capacity?: number;
}

export type TicketWithRelations = Ticket & {
  seat?: Seat | null;
  event?: Event;
};

interface CreateTicketParams {
  eventId: string;
  userId: string;
  reservationId: string;
  seatId?: string | null;
  attendee?: AttendeeInput;
}

export class BookingService {
  /**
   * Shared helper to issue a single cryptographic ticket
   */
  private static async issueSingleTicket(
    tx: Prisma.TransactionClient,
    params: CreateTicketParams
  ): Promise<TicketWithRelations> {
    const { eventId, userId, reservationId, seatId = null, attendee } = params;
    const ticketId = crypto.randomUUID();
    const ticketCode = CryptoProvider.generateRandomCode('PAS');
    const shareToken = crypto.randomUUID();

    const holderName = attendee?.name || null;
    const ticketType = attendee?.ticketType || 'INTEIRA';
    const studentId = ticketType === 'MEIA_ESTUDANTE' ? attendee?.studentIdNumber || null : null;

    const { token: qrToken, signature: qrSignature } = CryptoProvider.sign({
      ticketId,
      eventId,
      seatId,
      holderName,
      ticketType,
      timestamp: Date.now(),
    });

    return tx.ticket.create({
      data: {
        id: ticketId,
        ticketCode,
        qrToken,
        qrSignature,
        shareToken,
        status: TicketStatus.ISSUED,
        holderName,
        ticketType,
        studentId,
        userId,
        eventId,
        seatId,
        reservationId,
      },
      include: {
        seat: true,
        event: true,
      },
    });
  }

  static async processCheckout(userId: string, data: CheckoutInput) {
    const {
      eventId,
      seatIds,
      quantity,
      attendees = [],
      paymentMethod,
      cardDetails,
    } = data;

    // 1. Fetch event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!event) {
      throw new AppError('Evento não encontrado.', 404, 'EVENT_NOT_FOUND');
    }

    if (new Date(event.date).getTime() < Date.now()) {
      throw new AppError('Não é possível comprar ingressos para eventos que já ocorreram.', 400, 'EVENT_EXPIRED');
    }

    // 2. Gateway Processing with Stripe (Server-enforced decision)
    let stripeTransaction: StripePaymentResult | null = null;
    if (paymentMethod === 'CREDIT_CARD') {
      const approxAmount = Number(event.price) * (seatIds?.length || quantity || 1);
      const stripeResult = await StripePaymentService.processCardPayment(
        approxAmount,
        cardDetails || {
          cardNumber: '4242424242424242',
          holderName: 'Titular de Teste',
          cvv: '123',
        },
        { eventId: event.id, userId }
      );

      if (!stripeResult.success) {
        return {
          status: 'DECLINED' as const,
          message: stripeResult.message,
          reason: stripeResult.declineCode || 'STRIPE_ERROR',
          tickets: [] as TicketWithRelations[],
        };
      }

      stripeTransaction = stripeResult;
    }

    // 3. Execute atomic purchase in ACID transaction
    const checkoutResult = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const createdTickets: TicketWithRelations[] = [];

      if (event.type === 'SEATED') {
        if (!seatIds || seatIds.length === 0) {
          throw new AppError('Para eventos com assentos marcados, selecione ao menos 1 poltrona.', 400, 'NO_SEATS_SELECTED');
        }

        // Concurrency Guard: Atomic update of available seats
        const updateResult = await tx.seat.updateMany({
          where: {
            id: { in: seatIds },
            eventId: event.id,
            isAvailable: true,
          },
          data: {
            isAvailable: false,
          },
        });

        if (updateResult.count !== seatIds.length) {
          throw new AppError(
            'Um ou mais assentos selecionados acabaram de ser reservados por outro cliente. Por favor, escolha outros lugares.',
            409,
            'SEAT_ALREADY_RESERVED'
          );
        }

        // Fetch seat details for label and price calculation
        const seats = await tx.seat.findMany({
          where: { id: { in: seatIds } },
        });

        // Compute total amount with possible student half-price discounts
        const reservationItemsData = seats.map((seat, index) => {
          const attendee = attendees.find((a) => a.seatId === seat.id) || attendees[index];
          const isStudent = attendee?.ticketType === 'MEIA_ESTUDANTE';
          const itemPrice = isStudent ? Number(event.price) * 0.5 : Number(event.price);
          totalAmount += itemPrice;

          return {
            seatId: seat.id,
            price: itemPrice,
            attendee,
          };
        });

        // Create confirmed reservation
        const reservation = await tx.reservation.create({
          data: {
            userId,
            eventId: event.id,
            status: ReservationStatus.CONFIRMED,
            totalAmount,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            items: {
              create: reservationItemsData.map((item) => ({
                seatId: item.seatId,
                price: item.price,
              })),
            },
          },
        });

        // Generate cryptographic tickets for each seat using shared helper
        for (const item of reservationItemsData) {
          const seat = seats.find((s) => s.id === item.seatId);
          const ticket = await this.issueSingleTicket(tx, {
            eventId: event.id,
            userId,
            reservationId: reservation.id,
            seatId: seat?.id || null,
            attendee: item.attendee,
          });

          createdTickets.push(ticket);
        }
      } else {
        // GENERAL_ADMISSION event
        const requestedQty = quantity || 1;
        const currentTicketsCount = await tx.ticket.count({
          where: {
            eventId: event.id,
            status: { in: [TicketStatus.ISSUED, TicketStatus.USED] },
          },
        });

        if (currentTicketsCount + requestedQty > event.capacity) {
          throw new AppError(
            `Quantidade indisponível. Restam apenas ${Math.max(0, event.capacity - currentTicketsCount)} ingressos de pista.`,
            409,
            'CAPACITY_EXCEEDED'
          );
        }

        const tiers: TicketTier[] = Array.isArray(event.ticketTiers)
          ? (event.ticketTiers as unknown as TicketTier[])
          : [];

        const reservationItemsData = Array.from({ length: requestedQty }).map((_, index) => {
          const attendee = attendees[index];
          const isStudent = attendee?.ticketType === 'MEIA_ESTUDANTE';

          let basePrice = Number(event.price);
          if (attendee?.tierName || attendee?.tierId) {
            const matched = tiers.find(
              (t) =>
                t.id === attendee.tierId ||
                t.name?.toLowerCase() === attendee.tierName?.toLowerCase()
            );
            if (matched) {
              basePrice = Number(matched.price);
            }
          }

          const itemPrice = isStudent ? basePrice * 0.5 : basePrice;
          totalAmount += itemPrice;

          return {
            price: itemPrice,
            attendee,
          };
        });

        const reservation = await tx.reservation.create({
          data: {
            userId,
            eventId: event.id,
            status: ReservationStatus.CONFIRMED,
            totalAmount,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            items: {
              create: reservationItemsData.map((item) => ({
                price: item.price,
              })),
            },
          },
        });

        // Generate cryptographic tickets for General Admission using shared helper
        for (let i = 0; i < requestedQty; i++) {
          const item = reservationItemsData[i];
          const ticket = await this.issueSingleTicket(tx, {
            eventId: event.id,
            userId,
            reservationId: reservation.id,
            seatId: null,
            attendee: item.attendee,
          });

          createdTickets.push(ticket);
        }
      }

      return {
        status: 'APPROVED' as const,
        message:
          paymentMethod === 'CREDIT_CARD'
            ? 'Pagamento aprovado com sucesso via Stripe Gateway Oficial!'
            : 'Pagamento PIX confirmado com sucesso!',
        paymentMethod,
        totalAmount,
        stripeTransaction,
        tickets: createdTickets,
      };
    });

    // 4. Broadcast real-time WebSocket seat updates to all connected users
    if (checkoutResult.status === 'APPROVED' && event.type === 'SEATED' && seatIds && seatIds.length > 0) {
      let updatedSeats: Array<{ id: string; label?: string; isAvailable: boolean }> = checkoutResult.tickets
        .filter((t): t is TicketWithRelations & { seat: Seat } => Boolean(t.seat))
        .map((t) => ({
          id: t.seat.id,
          label: t.seat.label,
          isAvailable: false,
        }));

      if (updatedSeats.length === 0) {
        updatedSeats = seatIds.map((sid) => ({
          id: sid,
          isAvailable: false,
        }));
      }

      SocketService.broadcastSeatsUpdated(event.id, updatedSeats);
    }

    return checkoutResult;
  }
}

