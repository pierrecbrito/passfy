import { Request, Response } from 'express';
import { BookingService } from '../services/BookingService';
import { checkoutSimulationSchema } from '../dtos/bookingSchemas';

export class BookingController {
  static async simulateCheckout(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.id;
    const validatedData = checkoutSimulationSchema.parse(req.body);
    const result = await BookingService.processCheckout(userId, validatedData);
    const statusCode = result.status === 'APPROVED' ? 201 : 402;
    return res.status(statusCode).json(result);
  }
}
