import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './modules/auth/routes/authRoutes';
import { catalogRoutes } from './modules/catalog/routes/catalogRoutes';
import { eventRoutes } from './modules/events/routes/eventRoutes';
import { bookingRoutes } from './modules/bookings/routes/bookingRoutes';
import { ticketRoutes } from './modules/tickets/routes/ticketRoutes';
import { checkinRoutes } from './modules/checkin/routes/checkinRoutes';
import { aiRoutes } from './modules/ai/routes/aiRoutes';
import { errorHandler } from './core/middlewares/errorHandler';

dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, mobile or same-origin requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


app.use(express.json());

// Basic health check routes
app.get(['/', '/health', '/api/health'], (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'passfy-api',
  });
});


// App Routes (supporting both /api/* and /* routes directly)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/catalog', catalogRoutes);
app.use('/catalog', catalogRoutes);

app.use('/api/events', eventRoutes);
app.use('/events', eventRoutes);

app.use('/api/checkout', bookingRoutes);
app.use('/checkout', bookingRoutes);

app.use('/api/tickets', ticketRoutes);
app.use('/tickets', ticketRoutes);

app.use('/api/checkin', checkinRoutes);
app.use('/checkin', checkinRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

// Global Error Handler
app.use(errorHandler);


export { app };
