import { z } from 'zod';

export const validateCheckinSchema = z
  .object({
    eventId: z.string().uuid('ID do evento inválido.'),
    qrToken: z.string().optional(),
    ticketCode: z.string().optional(),
  })
  .refine((data) => !!data.qrToken || !!data.ticketCode, {
    message: 'Forneça o QR Code token ou o código do ingresso para validação.',
  });

export type ValidateCheckinInput = z.infer<typeof validateCheckinSchema>;
