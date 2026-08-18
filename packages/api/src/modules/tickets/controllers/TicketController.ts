import { Request, Response } from 'express';
import { TicketService } from '../services/TicketService';

export class TicketController {
  static async getMyTickets(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.id;
    const tickets = await TicketService.getMyTickets(userId);
    return res.status(200).json({ tickets });
  }

  static async getShareable(req: Request, res: Response): Promise<Response> {
    const { shareToken } = req.params;
    const ticket = await TicketService.getShareableTicket(shareToken);
    return res.status(200).json({ ticket });
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.id;
    const { id } = req.params;
    const ticket = await TicketService.getTicketById(id, userId);
    return res.status(200).json({ ticket });
  }
}
