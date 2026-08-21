import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService } from '../services/BookingService';
import { prisma } from '../../../core/database/prisma';
import { AppError } from '../../../core/errors/AppError';

describe('BookingService Checkout & Gateway Decision Logic', () => {
  const userId = 'user-buyer-100';
  const eventId = '11111111-1111-1111-1111-111111111111';
  const seatId = '22222222-2222-2222-2222-222222222222';

  const mockSeatedEvent = {
    id: eventId,
    title: 'Show Musical Seated',
    description: 'Evento de teste com assentos',
    category: 'CONCERT',
    type: 'SEATED',
    venue: 'Teatro Municipal',
    date: new Date(Date.now() + 86400000), // Future date
    price: 100 as any,
    capacity: 200,
    bannerUrl: null,
    externalId: null,
    externalSource: null,
    organizerId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { tickets: 0 },
  };

  const mockGaEvent = {
    ...mockSeatedEvent,
    id: 'ga-event-id',
    type: 'GENERAL_ADMISSION',
    capacity: 10,
    ticketTiers: [
      { id: 'tier-vip', name: 'VIP', price: 150 },
      { id: 'tier-pista', name: 'Pista Comum', price: 80 },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      return callback(prisma);
    });
  });


  describe('Server-Enforced Card Payment Matrix', () => {
    it('should decline payment when card has insufficient funds (ends with 0069)', async () => {
      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockSeatedEvent as any);

      const result = await BookingService.processCheckout(userId, {
        eventId,
        seatIds: [seatId],
        paymentMethod: 'CREDIT_CARD',
        cardDetails: {
          cardNumber: '4000 0000 0000 0069',
          holderName: 'Cliente Teste',
          expiryDate: '12/28',
          cvv: '123',
        },
      });

      expect(result.status).toBe('DECLINED');
      if (result.status === 'DECLINED') {
        expect(result.reason).toBe('insufficient_funds');
        expect(result.tickets).toHaveLength(0);
        expect(result.message).toContain('insufficient_funds');
      }
    });

    it('should decline payment when card is blocked (ends with 0002)', async () => {
      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockSeatedEvent as any);

      const result = await BookingService.processCheckout(userId, {
        eventId,
        seatIds: [seatId],
        paymentMethod: 'CREDIT_CARD',
        cardDetails: {
          cardNumber: '4000 0000 0000 0002',
          holderName: 'Cliente Teste',
          expiryDate: '12/28',
          cvv: '123',
        },
      });

      expect(result.status).toBe('DECLINED');
      if (result.status === 'DECLINED') {
        expect(result.reason).toBe('card_declined');
        expect(result.tickets).toHaveLength(0);
      }
    });

    it('should decline payment when card is expired (ends with 0127)', async () => {
      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockSeatedEvent as any);

      const result = await BookingService.processCheckout(userId, {
        eventId,
        seatIds: [seatId],
        paymentMethod: 'CREDIT_CARD',
        cardDetails: {
          cardNumber: '4000 0000 0000 0127',
          holderName: 'Cliente Teste',
          expiryDate: '01/20',
          cvv: '123',
        },
      });

      expect(result.status).toBe('DECLINED');
      if (result.status === 'DECLINED') {
        expect(result.reason).toBe('expired_card');
        expect(result.tickets).toHaveLength(0);
      }
    });

    it('should decline payment when flagged for fraud (ends with 0082)', async () => {
      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockSeatedEvent as any);

      const result = await BookingService.processCheckout(userId, {
        eventId,
        seatIds: [seatId],
        paymentMethod: 'CREDIT_CARD',
        cardDetails: {
          cardNumber: '4000 0000 0000 0082',
          holderName: 'Cliente Teste',
          expiryDate: '12/28',
          cvv: '123',
        },
      });

      expect(result.status).toBe('DECLINED');
      if (result.status === 'DECLINED') {
        expect(result.reason).toBe('fraudulent');
        expect(result.tickets).toHaveLength(0);
      }
    });
  });

  describe('SEATED Checkout & Discounts', () => {
    it('should calculate 50% discount for MEIA_ESTUDANTE and issue ticket', async () => {
      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockSeatedEvent as any);

      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        const mockTx = {
          seat: {
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
            findMany: vi.fn().mockResolvedValue([
              {
                id: seatId,
                eventId,
                row: 'B',
                number: 4,
                label: 'B-4',
                isAvailable: true,
              },
            ]),
          },
          reservation: {
            create: vi.fn().mockResolvedValue({ id: 'res-id', totalAmount: 50 }),
          },
          ticket: {
            create: vi.fn().mockImplementation(async ({ data, include }) => ({
              ...data,
              seat: { id: seatId, label: 'B-4' },
              event: mockSeatedEvent,
            })),
          },
        };
        return callback(mockTx);
      });

      const result = await BookingService.processCheckout(userId, {
        eventId,
        seatIds: [seatId],
        paymentMethod: 'CREDIT_CARD',
        cardDetails: {
          cardNumber: '4242 4242 4242 4242', // Approved test card
          holderName: 'Estudante Teste',
          cvv: '123',
        },
        attendees: [
          {
            seatId,
            name: 'Estudante Teste',
            ticketType: 'MEIA_ESTUDANTE',
            studentIdNumber: 'EST-998877',
          },
        ],
      });

      expect(result.status).toBe('APPROVED');
      if (result.status === 'APPROVED') {
        expect(result.totalAmount).toBe(50); // 100 * 0.5 = 50
        expect(result.tickets).toHaveLength(1);
        expect(result.tickets[0].ticketType).toBe('MEIA_ESTUDANTE');
        expect(result.tickets[0].studentId).toBe('EST-998877');
      }
    });


    it('should reject seated checkout if no seats are provided', async () => {
      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockSeatedEvent as any);

      await expect(
        BookingService.processCheckout(userId, {
          eventId,
          seatIds: [],
          paymentMethod: 'PIX',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'NO_SEATS_SELECTED',
      });
    });
  });

  describe('GENERAL_ADMISSION Checkout', () => {
    it('should reject purchase when requested quantity exceeds available capacity', async () => {
      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockGaEvent as any);

      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        const mockTx = {
          ticket: {
            count: vi.fn().mockResolvedValue(9), // 9 out of 10 already sold
          },
        };
        return callback(mockTx);
      });

      await expect(
        BookingService.processCheckout(userId, {
          eventId: 'ga-event-id',
          quantity: 2, // 9 + 2 = 11 > 10
          paymentMethod: 'PIX',
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'CAPACITY_EXCEEDED',
      });
    });
  });

  describe('Expired Events Protection', () => {
    it('should reject checkout for events that already occurred in the past', async () => {
      const expiredEvent = {
        ...mockSeatedEvent,
        date: new Date(Date.now() - 3600000), // 1 hour ago
      };

      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(expiredEvent as any);

      await expect(
        BookingService.processCheckout(userId, {
          eventId,
          seatIds: [seatId],
          paymentMethod: 'PIX',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'EVENT_EXPIRED',
      });
    });
  });
});
