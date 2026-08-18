import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './modules/auth/routes/authRoutes';
import { catalogRoutes } from './modules/catalog/routes/catalogRoutes';
import { eventRoutes } from './modules/events/routes/eventRoutes';
import { bookingRoutes } from './modules/bookings/routes/bookingRoutes';
import { ticketRoutes } from './modules/tickets/routes/ticketRoutes';
import { checkinRoutes } from './modules/checkin/routes/checkinRoutes';
import { errorHandler } from './core/middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

app.use(express.json());

// Basic health check route
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'passfy-api',
  });
});

// App Routes
app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/checkout', bookingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/checkin', checkinRoutes);

// Global Error Handler
app.use(errorHandler);

export { app };
