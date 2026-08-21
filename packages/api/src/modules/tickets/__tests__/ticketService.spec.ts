import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketService } from '../services/TicketService';
import { prisma } from '../../../core/database/prisma';
import { TicketStatus } from '@prisma/client';
import { AppError } from '../../../core/errors/AppError';

describe('TicketService Security & Lifecycle', () => {
  const userId = 'user-owner-123';
  const otherUserId = 'user-intruder-456';
  const ticketId = 'ticket-123';
  const shareToken = 'share-safe-uuid-123';
  const eventId = 'event-123';
  const seatId = 'seat-123';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getShareableTicket (Public Route Protection)', () => {
    it('should return safe public metadata and NEVER expose qrDataUrl, qrToken or qrSignature', async () => {
      vi.spyOn(prisma.ticket, 'findUnique').mockResolvedValue({
        id: ticketId,
        shareToken,
        status: TicketStatus.ISSUED,
        holderName: 'Carlos Silva',
        ticketType: 'INTEIRA',
        studentId: null,
        createdAt: new Date(),
        user: { name: 'Carlos Silva' },
        event: {
          id: eventId,
          title: 'Grande Show ao Vivo',
          description: 'Apresentação única',
          category: 'CONCERT',
          type: 'SEATED',
          venue: 'Allianz Parque',
          date: new Date(Date.now() + 86400000),
          price: 150 as any,
          bannerUrl: 'https://example.com/banner.jpg',
        },
        seat: {
          id: seatId,
          row: 'B',
          number: 12,
          label: 'B-12',
        },
      } as any);

      const result = await TicketService.getShareableTicket(shareToken);

      expect(result).toBeDefined();
      expect(result.id).toBe(ticketId);
      expect(result.holderName).toBe('Carlos Silva');
      expect(result.ticketCode).toBe('PAS-•••••');
      expect(result.isPublicView).toBe(true);

      // SECURITY CRITICAL ASSERTIONS:
      expect((result as any).qrDataUrl).toBeUndefined();
      expect((result as any).qrToken).toBeUndefined();
      expect((result as any).qrSignature).toBeUndefined();
    });

    it('should throw 404 when share token is invalid or not found', async () => {
      vi.spyOn(prisma.ticket, 'findUnique').mockResolvedValue(null);

      await expect(TicketService.getShareableTicket('non-existent-token')).rejects.toThrow(AppError);
    });
  });

  describe('getMyTickets (Authenticated Owner Route)', () => {
    it('should return tickets with generated QR Code data URL for authenticated owner', async () => {
      vi.spyOn(prisma.ticket, 'findMany').mockResolvedValue([
        {
          id: ticketId,
          ticketCode: 'PAS-ABC12',
          qrToken: 'valid.token.data',
          qrSignature: 'valid.sig',
          shareToken,
          status: TicketStatus.ISSUED,
          holderName: 'Carlos Silva',
          ticketType: 'INTEIRA',
          studentId: null,
          userId,
          eventId,
          seatId,
          reservationId: 'res-1',
          usedAt: null,
          usedByGatekeeperId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          event: {
            id: eventId,
            title: 'Grande Show',
            description: 'Show',
            category: 'CONCERT',
            type: 'SEATED',
            venue: 'Arena',
            date: new Date(Date.now() + 86400000),
            price: 100 as any,
            bannerUrl: null,
          },
          seat: { id: seatId, row: 'A', number: 1, label: 'A-1', isAvailable: false, eventId, createdAt: new Date(), updatedAt: new Date() },
        },
      ] as any);

      const tickets = await TicketService.getMyTickets(userId);

      expect(tickets).toHaveLength(1);
      expect(tickets[0].id).toBe(ticketId);
      expect(tickets[0].qrDataUrl).toBeDefined();
      expect(tickets[0].qrDataUrl).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('returnTicketToStock', () => {
    it('should reject return if requester is not the ticket owner', async () => {
      vi.spyOn(prisma.ticket, 'findUnique').mockResolvedValue({
        id: ticketId,
        userId, // belongs to user-owner-123
        status: TicketStatus.ISSUED,
        event: { date: new Date(Date.now() + 86400000) },
        seat: { id: seatId },
      } as any);

      await expect(TicketService.returnTicketToStock(ticketId, otherUserId)).rejects.toMatchObject({
        statusCode: 403,
        code: 'FORBIDDEN',
      });
    });

    it('should reject return for already USED ticket', async () => {
      vi.spyOn(prisma.ticket, 'findUnique').mockResolvedValue({
        id: ticketId,
        userId,
        status: TicketStatus.USED,
        event: { date: new Date(Date.now() + 86400000) },
        seat: { id: seatId },
      } as any);

      await expect(TicketService.returnTicketToStock(ticketId, userId)).rejects.toMatchObject({
        statusCode: 400,
        code: 'TICKET_ALREADY_USED',
      });
    });

    it('should reject return for expired/past event', async () => {
      vi.spyOn(prisma.ticket, 'findUnique').mockResolvedValue({
        id: ticketId,
        userId,
        status: TicketStatus.ISSUED,
        event: { date: new Date(Date.now() - 86400000) }, // Event in the past
        seat: { id: seatId },
      } as any);

      await expect(TicketService.returnTicketToStock(ticketId, userId)).rejects.toMatchObject({
        statusCode: 400,
        code: 'EVENT_ALREADY_OCCURRED',
      });
    });
  });
});
