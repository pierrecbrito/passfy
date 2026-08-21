import { describe, it, expect, vi } from 'vitest';
import { BookingService } from '../services/BookingService';
import { prisma } from '../../../core/database/prisma';

// Mock prisma for isolated concurrency unit testing
describe('Booking Concurrency & Race Condition Prevention', () => {
  it('should reject second purchase when two users attempt to buy the same seat concurrently', async () => {
    const fakeEventId = '11111111-1111-1111-1111-111111111111';
    const fakeSeatId = '22222222-2222-2222-2222-222222222222';
    const user1Id = '33333333-3333-3333-3333-333333333331';
    const user2Id = '33333333-3333-3333-3333-333333333332';

    // Mock event retrieval
    vi.spyOn(prisma.event, 'findUnique').mockResolvedValue({
      id: fakeEventId,
      title: 'Filme Concorrente',
      description: 'Teste',
      category: 'MOVIE',
      type: 'SEATED',
      venue: 'Sala 1',
      date: new Date(Date.now() + 86400000),
      price: 50 as any,
      capacity: 10,
      bannerUrl: null,
      externalId: null,
      externalSource: null,
      organizerId: 'org-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { tickets: 0 },
    } as any);

    let seatAvailable = true;

    // Mock atomic transaction
    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      const mockTx = {
        seat: {
          updateMany: vi.fn().mockImplementation(async ({ where }) => {
            if (seatAvailable) {
              seatAvailable = false;
              return { count: 1 }; // Seat successfully locked and reserved
            }
            return { count: 0 }; // Seat was already locked by concurrent transaction
          }),
          findMany: vi.fn().mockResolvedValue([
            {
              id: fakeSeatId,
              eventId: fakeEventId,
              row: 'A',
              number: 1,
              label: 'A-1',
              isAvailable: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        },
        reservation: {
          create: vi.fn().mockResolvedValue({ id: 'res-id', totalAmount: 50 }),
        },
        ticket: {
          create: vi.fn().mockResolvedValue({
            id: 'ticket-id',
            ticketCode: 'PAS-TEST1',
            qrToken: 'dummy.token',
            qrSignature: 'dummy.sig',
            shareToken: 'share-uuid',
            status: 'ISSUED',
            userId: user1Id,
            eventId: fakeEventId,
            seatId: fakeSeatId,
          }),
        },
      };

      return callback(mockTx);
    });

    // Run both purchases simultaneously with standard approved test card
    const purchase1Promise = BookingService.processCheckout(user1Id, {
      eventId: fakeEventId,
      seatIds: [fakeSeatId],
      paymentMethod: 'CREDIT_CARD',
      cardDetails: {
        cardNumber: '4242424242424242',
        holderName: 'User 1',
        cvv: '123',
      },
      quantity: 1,
    });

    const purchase2Promise = BookingService.processCheckout(user2Id, {
      eventId: fakeEventId,
      seatIds: [fakeSeatId],
      paymentMethod: 'CREDIT_CARD',
      cardDetails: {
        cardNumber: '4242424242424242',
        holderName: 'User 2',
        cvv: '123',
      },
      quantity: 1,
    });

    const results = await Promise.allSettled([purchase1Promise, purchase2Promise]);

    // One must be fulfilled (success) and one must be rejected (SEAT_ALREADY_RESERVED)
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    if (rejected[0].status === 'rejected') {
      const error: any = rejected[0].reason;
      expect(error.code).toBe('SEAT_ALREADY_RESERVED');
      expect(error.statusCode).toBe(409);
    }
  });
});

