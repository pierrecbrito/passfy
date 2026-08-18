import { Request, Response } from 'express';
import { CheckinService } from '../services/CheckinService';
import { validateCheckinSchema } from '../dtos/checkinSchemas';

export class CheckinController {
  static async validate(req: Request, res: Response): Promise<Response> {
    const gatekeeperId = req.user!.id;
    const validatedData = validateCheckinSchema.parse(req.body);
    const result = await CheckinService.validate(gatekeeperId, validatedData);

    const statusHttpMap: Record<string, number> = {
      VALID: 200,
      ALREADY_USED: 409,
      WRONG_EVENT: 422,
      INVALID: 400,
    };

    const httpCode = statusHttpMap[result.status] || 200;
    return res.status(httpCode).json(result);
  }
}
