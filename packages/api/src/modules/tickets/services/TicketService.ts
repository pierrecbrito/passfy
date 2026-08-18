import { prisma } from '../../../core/database/prisma';
import { AppError } from '../../../core/errors/AppError';
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
      include: {
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
        seat: true,
      },
    });

    if (!ticket) {
      throw new AppError('Ingresso não encontrado ou link expirado.', 404, 'TICKET_NOT_FOUND');
    }

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
}
