import { prisma } from '../../../core/database/prisma';
import { AppError } from '../../../core/errors/AppError';
import { SocketService } from '../../../core/websocket/socketServer';
import { TicketStatus } from '@prisma/client';
import QRCode from 'qrcode';

export class TicketService {
  static async getMyTickets(userId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            type: true,
            venue: true,
            date: true,
            price: true,
            bannerUrl: true,
          },
        },
        seat: true,
      },
    });

    const ticketsWithQrImages = await Promise.all(
      tickets.map(async (ticket) => {
        const qrDataUrl = await QRCode.toDataURL(ticket.qrToken, {
          width: 300,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });

        return {
          ...ticket,
          qrDataUrl,
        };
      })
    );

    return ticketsWithQrImages;
  }

  static async getShareableTicket(shareToken: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { shareToken },
      select: {
        id: true,
        shareToken: true,
        status: true,
        holderName: true,
        ticketType: true,
        studentId: true,
        createdAt: true,
        user: {
          select: { name: true },
        },
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            type: true,
            venue: true,
            date: true,
            price: true,
            bannerUrl: true,
          },
        },
        seat: {
          select: {
            id: true,
            row: true,
            number: true,
            label: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new AppError('Ingresso não encontrado ou link expirado.', 404, 'TICKET_NOT_FOUND');
    }

    // Return safe public metadata with masked code — strictly NO qrToken, qrSignature or qrDataUrl
    return {
      ...ticket,
      ticketCode: 'PAS-•••••',
      isPublicView: true,
    };
  }


  static async getTicketById(id: string, userId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        event: true,
        seat: true,
      },
    });

    if (!ticket || ticket.userId !== userId) {
      throw new AppError('Ingresso não encontrado.', 404, 'TICKET_NOT_FOUND');
    }

    const qrDataUrl = await QRCode.toDataURL(ticket.qrToken, {
      width: 300,
      margin: 2,
    });

    return {
      ...ticket,
      qrDataUrl,
    };
  }

  /**
   * Return a ticket to stock (Cancelation by the customer)
   */
  static async returnTicketToStock(ticketId: string, userId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        seat: true,
      },
    });

    if (!ticket) {
      throw new AppError('Ingresso não encontrado.', 404, 'TICKET_NOT_FOUND');
    }

    if (ticket.userId !== userId) {
      throw new AppError('Você não tem permissão para devolver este ingresso.', 403, 'FORBIDDEN');
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new AppError('Este ingresso já foi devolvido ao estoque.', 400, 'TICKET_ALREADY_CANCELLED');
    }

    if (ticket.status === TicketStatus.USED) {
      throw new AppError(
        'Não é possível devolver um ingresso que já foi validado na portaria.',
        400,
        'TICKET_ALREADY_USED'
      );
    }

    if (new Date(ticket.event.date).getTime() < Date.now()) {
      throw new AppError(
        'Não é possível devolver ingressos de eventos que já ocorreram.',
        400,
        'EVENT_ALREADY_OCCURRED'
      );
    }

    // Atomic transaction
    const updatedTicket = await prisma.$transaction(async (tx) => {
      // 1. Cancel the ticket
      const cancelled = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: TicketStatus.CANCELLED,
        },
        include: {
          event: true,
          seat: true,
        },
      });

      // 2. If it was seated, free the seat back to stock
      if (ticket.seatId) {
        await tx.seat.update({
          where: { id: ticket.seatId },
          data: {
            isAvailable: true,
          },
        });
      }

      return cancelled;
    });

    // 3. Real-time WebSocket synchronization if seated
    if (ticket.seatId && ticket.seat) {
      SocketService.broadcastSeatsUpdated(ticket.eventId, [
        {
          id: ticket.seat.id,
          label: ticket.seat.label,
          isAvailable: true,
        },
      ]);
    }

    return updatedTicket;
  }
}
