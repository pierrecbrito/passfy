import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required and cannot be empty.'),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters for cryptographic safety.'),
  QR_SECRET_KEY: z
    .string()
    .min(32, 'QR_SECRET_KEY must be a strong secret of at least 32 characters for HMAC-SHA256 signing.'),
  CORS_ORIGIN: z.string().default('*'),
  TICKETMASTER_API_KEY: z.string().optional().default(''),
  TICKETMASTER_BASE_URL: z.string().default('https://app.ticketmaster.com/discovery/v2'),
  GEMINI_API_KEY: z.string().optional().default(''),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  SPOTIFY_CLIENT_ID: z.string().optional().default(''),
  SPOTIFY_CLIENT_SECRET: z.string().optional().default(''),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const formattedErrors = _env.error.format();
  console.error('❌ [FATAL] Invalid or missing required environment variables:');
  console.error(JSON.stringify(formattedErrors, null, 2));
  throw new Error('Server cannot start: Missing or invalid environment variables. Check .env configuration.');
}

export const env = _env.data;

