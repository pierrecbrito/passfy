import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Global error handler must be registered after routes
export function registerErrorHandler() {
  app.use(errorHandler);
}

export { app };
