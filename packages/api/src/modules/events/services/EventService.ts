import { prisma } from '../../../core/database/prisma';
import { AppError } from '../../../core/errors/AppError';
import { CreateEventInput, ListEventsQuery } from '../dtos/eventSchemas';

export class EventService {
  static async createEvent(organizerId: string, data: CreateEventInput) {
    const eventDate = new Date(data.date);

    if (eventDate.getTime() < Date.now()) {
      throw new AppError('A data do evento não pode ser no passado.', 400, 'INVALID_EVENT_DATE');
    }

    return prisma.$transaction(async (tx) => {
      // If SEATED, capacity equals rowsCount * seatsPerRow
      const capacity =
        data.type === 'SEATED'
          ? (data.rowsCount || 6) * (data.seatsPerRow || 8)
          : data.capacity;

      const event = await tx.event.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          type: data.type,
          venue: data.venue,
          date: eventDate,
          price: data.price,
          capacity,
          bannerUrl: data.bannerUrl,
          externalId: data.externalId,
          externalSource: data.externalSource,
          organizerId,
        },
        include: {
          organizer: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Generate seats for SEATED events
      if (data.type === 'SEATED') {
        const rowsCount = Math.min(data.rowsCount || 6, 26);
        const seatsPerRow = Math.min(data.seatsPerRow || 8, 30);
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        const seatsData = [];
        for (let r = 0; r < rowsCount; r++) {
          const rowLetter = alphabet[r];
          for (let num = 1; num <= seatsPerRow; num++) {
            seatsData.push({
              eventId: event.id,
              row: rowLetter,
              number: num,
              label: `${rowLetter}-${num}`,
              isAvailable: true,
            });
          }
        }

        await tx.seat.createMany({
          data: seatsData,
        });
      }

      return event;
    });
  }

  static async listEvents(query: ListEventsQuery) {
    const { search, category, type, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search && search.trim()) {
      whereClause.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { venue: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (type && type !== 'ALL') {
      whereClause.type = type;
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where: whereClause }),
      prisma.event.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          organizer: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              seats: true,
              tickets: true,
            },
          },
        },
      }),
    ]);

    // Calculate available capacity for each event
    const eventsWithAvailability = events.map((event) => {
      const ticketsSold = event._count.tickets;
      const availableCapacity = Math.max(0, event.capacity - ticketsSold);
      return {
        ...event,
        ticketsSold,
        availableCapacity,
      };
    });

    return {
      events: eventsWithAvailability,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        seats: {
          orderBy: [{ row: 'asc' }, { number: 'asc' }],
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      throw new AppError('Evento não encontrado.', 404, 'EVENT_NOT_FOUND');
    }

    const ticketsSold = event._count.tickets;
    const availableCapacity = Math.max(0, event.capacity - ticketsSold);

    return {
      ...event,
      ticketsSold,
      availableCapacity,
    };
  }

  static async getOrganizerEvents(organizerId: string) {
    const events = await prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            tickets: true,
            seats: true,
          },
        },
      },
    });

    return events.map((event) => ({
      ...event,
      ticketsSold: event._count.tickets,
      availableCapacity: Math.max(0, event.capacity - event._count.tickets),
    }));
  }
}
