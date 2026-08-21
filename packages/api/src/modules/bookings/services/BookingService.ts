import { prisma } from '../../../core/database/prisma';
import { AppError } from '../../../core/errors/AppError';
import { CryptoProvider } from '../../../core/security/cryptoProvider';
import { CheckoutSimulationInput } from '../dtos/bookingSchemas';
import { TicketStatus, ReservationStatus } from '@prisma/client';
import crypto from 'crypto';

export class BookingService {
  static async processCheckout(userId: string, data: CheckoutSimulationInput) {
    const { eventId, seatIds, quantity, attendees = [], paymentMethod, simulateStatus, declineReason } = data;

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

    // 2. Validate simulation failure upfront if requested
    if (simulateStatus === 'DECLINED') {
      const declineMessages: Record<string, string> = {
        INSUFFICIENT_FUNDS: 'Pagamento recusado: Saldo insuficiente ou limite do cartão excedido.',
        CARD_BLOCKED: 'Pagamento recusado: Cartão bloqueado pela instituição financeira.',
        EXPIRED_CARD: 'Pagamento recusado: Cartão expirado.',
        FRAUD_SUSPICION: 'Pagamento recusado: Transação não autorizada por suspeita de fraude.',
      };

      return {
        status: 'DECLINED',
        message: declineMessages[declineReason || 'INSUFFICIENT_FUNDS'] || 'Pagamento recusado.',
        reason: declineReason || 'INSUFFICIENT_FUNDS',
        tickets: [],
      };
    }

    // 3. Execute atomic purchase in ACID transaction
    return prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const createdTickets = [];

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

        // Generate cryptographic tickets for each seat
        for (const item of reservationItemsData) {
          const seat = seats.find((s) => s.id === item.seatId)!;
          const ticketId = crypto.randomUUID();
          const ticketCode = CryptoProvider.generateRandomCode('PAS');
          const shareToken = crypto.randomUUID();

          const holderName = item.attendee?.name || null;
          const ticketType = item.attendee?.ticketType || 'INTEIRA';
          const studentId = ticketType === 'MEIA_ESTUDANTE' ? item.attendee?.studentIdNumber || null : null;

          const { token: qrToken, signature: qrSignature } = CryptoProvider.sign({
            ticketId,
            eventId: event.id,
            seatId: seat.id,
            holderName,
            ticketType,
            timestamp: Date.now(),
          });

          const ticket = await tx.ticket.create({
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
              eventId: event.id,
              seatId: seat.id,
              reservationId: reservation.id,
            },
            include: {
              seat: true,
              event: true,
            },
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

        const tiers: any[] = Array.isArray((event as any).ticketTiers)
          ? ((event as any).ticketTiers as any[])
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

        for (let i = 0; i < requestedQty; i++) {
          const item = reservationItemsData[i];
          const ticketId = crypto.randomUUID();
          const ticketCode = CryptoProvider.generateRandomCode('PAS');
          const shareToken = crypto.randomUUID();

          const holderName = item.attendee?.name || null;
          const ticketType = item.attendee?.ticketType || 'INTEIRA';
          const studentId = ticketType === 'MEIA_ESTUDANTE' ? item.attendee?.studentIdNumber || null : null;

          const { token: qrToken, signature: qrSignature } = CryptoProvider.sign({
            ticketId,
            eventId: event.id,
            seatId: null,
            holderName,
            ticketType,
            timestamp: Date.now(),
          });

          const ticket = await tx.ticket.create({
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
              eventId: event.id,
              reservationId: reservation.id,
            },
            include: {
              event: true,
            },
          });

          createdTickets.push(ticket);
        }
      }

      return {
        status: 'APPROVED',
        message: 'Pagamento confirmado com sucesso! Seus ingressos foram emitidos.',
        paymentMethod,
        totalAmount,
        tickets: createdTickets,
      };
    });
  }
}
