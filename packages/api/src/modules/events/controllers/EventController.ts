import { Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { createEventSchema, listEventsQuerySchema } from '../dtos/eventSchemas';

export class EventController {
  static async create(req: Request, res: Response): Promise<Response> {
    const organizerId = req.user!.id;
    const validatedData = createEventSchema.parse(req.body);
    const event = await EventService.createEvent(organizerId, validatedData);
    return res.status(201).json({ event });
  }

  static async list(req: Request, res: Response): Promise<Response> {
    const validatedQuery = listEventsQuerySchema.parse(req.query);
    const result = await EventService.listEvents(validatedQuery);
    return res.status(200).json(result);
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const event = await EventService.getEventById(id);
    return res.status(200).json({ event });
  }

  static async getMyEvents(req: Request, res: Response): Promise<Response> {
    const organizerId = req.user!.id;
    const events = await EventService.getOrganizerEvents(organizerId);
    return res.status(200).json({ events });
  }
}
