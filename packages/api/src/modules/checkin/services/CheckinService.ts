import { prisma } from '../../../core/database/prisma';
import { CryptoProvider } from '../../../core/security/cryptoProvider';
import { ValidateCheckinInput } from '../dtos/checkinSchemas';
import { TicketStatus } from '@prisma/client';

export type CheckinValidationResult =
  | {
      status: 'VALID';
      message: string;
      ticket: {
        id: string;
        ticketCode: string;
        customerName: string;
        eventTitle: string;
        venue: string;
        seatLabel?: string | null;
        validatedAt: Date;
      };
    }
  | {
      status: 'ALREADY_USED';
      message: string;
      usedAt?: Date | null;
      validatedBy?: string | null;
      ticketCode?: string;
      customerName?: string;
    }
  | {
      status: 'WRONG_EVENT';
      message: string;
      expectedEventTitle: string;
      ticketEventTitle: string;
      ticketCode: string;
    }
  | {
      status: 'INVALID';
      message: string;
      reason: string;
    };

export class CheckinService {
  static async validate(gatekeeperId: string, data: ValidateCheckinInput): Promise<CheckinValidationResult> {
    const { eventId, qrToken, ticketCode } = data;

    // 1. Verify gatekeeper's current selected event
    const currentEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, venue: true, date: true },
    });

    if (!currentEvent) {
      return {
        status: 'INVALID',
        message: 'Evento da portaria não encontrado.',
        reason: 'EVENT_NOT_FOUND',
      };
    }

    let ticketIdToSearch: string | null = null;
    let codeToSearch: string | null = null;

    // 2. Cryptographic QR Verification if qrToken provided
    if (qrToken && qrToken.trim()) {
      const verification = CryptoProvider.verify(qrToken.trim());
      if (!verification.isValid || !verification.payload) {
        return {
          status: 'INVALID',
          message: 'QR Code inválido, forjado ou assinatura criptográfica corrompida.',
          reason: 'INVALID_SIGNATURE',
        };
      }
      ticketIdToSearch = verification.payload.ticketId;
    } else if (ticketCode && ticketCode.trim()) {
      codeToSearch = ticketCode.trim().toUpperCase();
    }

    // 3. Find ticket in DB
    const ticket = await prisma.ticket.findFirst({
      where: ticketIdToSearch
        ? { id: ticketIdToSearch }
        : { ticketCode: codeToSearch! },
      include: {
        user: { select: { name: true } },
        event: { select: { id: true, title: true, venue: true } },
        seat: { select: { label: true } },
        usedByGatekeeper: { select: { name: true } },
      },
    });

    if (!ticket) {
      return {
        status: 'INVALID',
        message: 'Ingresso não encontrado no sistema.',
        reason: 'TICKET_NOT_FOUND',
      };
    }

    // 4. Verify if ticket belongs to this event
    if (ticket.eventId !== eventId) {
      return {
        status: 'WRONG_EVENT',
        message: `Ingresso pertence a outro evento: "${ticket.event.title}".`,
        expectedEventTitle: currentEvent.title,
        ticketEventTitle: ticket.event.title,
        ticketCode: ticket.ticketCode,
      };
    }

    // 5. Check if already used
    if (ticket.status === TicketStatus.USED) {
      return {
        status: 'ALREADY_USED',
        message: `Este ingresso já foi utilizado em ${new Date(ticket.usedAt!).toLocaleString('pt-BR')}.`,
        usedAt: ticket.usedAt,
        validatedBy: ticket.usedByGatekeeper?.name || 'Portaria',
        ticketCode: ticket.ticketCode,
        customerName: ticket.user.name,
      };
    }

    // 6. Atomic check-in update (prevent race conditions on double scanning)
    const updateResult = await prisma.ticket.updateMany({
      where: {
        id: ticket.id,
        status: TicketStatus.ISSUED,
      },
      data: {
        status: TicketStatus.USED,
        usedAt: new Date(),
        usedByGatekeeperId: gatekeeperId,
      },
    });

    if (updateResult.count === 0) {
      return {
        status: 'ALREADY_USED',
        message: 'Ingresso acabou de ser validado em outro ponto de entrada.',
        ticketCode: ticket.ticketCode,
      };
    }

    return {
      status: 'VALID',
      message: 'Entrada autorizada com sucesso!',
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        customerName: ticket.user.name,
        eventTitle: ticket.event.title,
        venue: ticket.event.venue,
        seatLabel: ticket.seat?.label || null,
        validatedAt: new Date(),
      },
    };
  }
}
