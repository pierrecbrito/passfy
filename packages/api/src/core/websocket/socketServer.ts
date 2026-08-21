import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export interface SeatUpdatePayload {
  eventId: string;
  seats: Array<{
    id: string;
    label?: string;
    isAvailable: boolean;
  }>;
  timestamp: number;
}

export class SocketService {
  private static io: SocketIOServer | null = null;

  static initialize(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket: Socket) => {
      // Client joins event-specific room
      socket.on('join_event', (eventId: string) => {
        if (eventId) {
          socket.join(`event:${eventId}`);
          console.log(`⚡ [WebSocket] Client ${socket.id} joined room event:${eventId}`);
        }
      });

      // Client leaves event room
      socket.on('leave_event', (eventId: string) => {
        if (eventId) {
          socket.leave(`event:${eventId}`);
          console.log(`⚡ [WebSocket] Client ${socket.id} left room event:${eventId}`);
        }
      });

      socket.on('disconnect', () => {
        // disconnected
      });
    });

    console.log('⚡ WebSocket Server initialized with Socket.IO');
    return this.io;
  }

  static getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Broadcast seat availability updates in real-time to all clients viewing the event
   */
  static broadcastSeatsUpdated(
    eventId: string,
    updatedSeats: Array<{ id: string; label?: string; isAvailable: boolean }>
  ): void {
    if (!this.io) return;

    const payload: SeatUpdatePayload = {
      eventId,
      seats: updatedSeats,
      timestamp: Date.now(),
    };

    console.log(`⚡ [WebSocket] Emitting seats_updated to event:${eventId} and broadcast:`, payload);

    // Broadcast to room and global
    this.io.to(`event:${eventId}`).emit('seats_updated', payload);
    this.io.emit('seats_updated', payload);
  }
}
