import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres.'),
  description: z.string().min(5, 'A descrição deve ter pelo menos 5 caracteres.'),
  category: z.enum(['MOVIE', 'CONCERT', 'THEATER', 'OTHER']).default('MOVIE'),
  type: z.enum(['SEATED', 'GENERAL_ADMISSION']).default('SEATED'),
  venue: z.string().min(2, 'O local/sala é obrigatório.'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data e hora do evento inválidas.',
  }),
  price: z.coerce.number().positive('O preço deve ser maior que zero.'),
  capacity: z.coerce.number().int().positive('A capacidade deve ser maior que zero.'),
  bannerUrl: z.string().url('URL da imagem inválida.').optional().nullable(),
  externalId: z.string().optional().nullable(),
  externalSource: z.string().optional().nullable(),
  rowsCount: z.coerce.number().int().min(1).max(26).optional().default(6),
  seatsPerRow: z.coerce.number().int().min(1).max(30).optional().default(8),
});

export const listEventsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.enum(['MOVIE', 'CONCERT', 'THEATER', 'OTHER', 'ALL']).optional().default('ALL'),
  type: z.enum(['SEATED', 'GENERAL_ADMISSION', 'ALL']).optional().default('ALL'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
