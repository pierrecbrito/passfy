import { z } from 'zod';

export const attendeeSchema = z.object({
  seatId: z.string().optional(),
  name: z.string().min(2, 'Nome do titular deve ter ao menos 2 caracteres.').optional(),
  ticketType: z.enum(['INTEIRA', 'MEIA_ESTUDANTE']).optional().default('INTEIRA'),
  studentIdNumber: z.string().optional(),
});

export const checkoutSimulationSchema = z.object({
  eventId: z.string().uuid('ID do evento inválido.'),
  seatIds: z.array(z.string().uuid()).optional(),
  quantity: z.coerce.number().int().min(1).max(10).optional(),
  attendees: z.array(attendeeSchema).optional(),
  paymentMethod: z.enum(['CREDIT_CARD', 'PIX']).default('CREDIT_CARD'),
  cardDetails: z
    .object({
      holderName: z.string().min(2).optional(),
      cardNumber: z.string().min(13).max(19).optional(),
      expiryDate: z.string().optional(),
      cvv: z.string().min(3).max(4).optional(),
    })
    .optional(),
  simulateStatus: z.enum(['APPROVED', 'DECLINED']).default('APPROVED'),
  declineReason: z
    .enum(['INSUFFICIENT_FUNDS', 'CARD_BLOCKED', 'EXPIRED_CARD', 'FRAUD_SUSPICION'])
    .optional(),
});

export type CheckoutSimulationInput = z.infer<typeof checkoutSimulationSchema>;
export type AttendeeInput = z.infer<typeof attendeeSchema>;
