import { Request, Response } from 'express';
import { z } from 'zod';
import { GeminiAiService } from '../services/GeminiAiService';

const recommendQuerySchema = z.object({
  prompt: z.string().min(1, 'O prompt é obrigatório.'),
});

export class AiController {
  static async recommend(req: Request, res: Response): Promise<Response> {
    const { prompt } = recommendQuerySchema.parse(req.body);
    const result = await GeminiAiService.recommendEvents(prompt);
    return res.status(200).json(result);
  }
}
