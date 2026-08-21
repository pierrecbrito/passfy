import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z
    .string()
    .default(
      'postgresql://passfy_user:passfy_password@localhost:5432/passfy_db?schema=public'
    ),
  JWT_SECRET: z.string().default('super_secret_passfy_jwt_key_development_only_change_in_production'),
  QR_SECRET_KEY: z.string().default('passfy_cryptographic_qr_signing_key_hmac_sha256_secret'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  TICKETMASTER_API_KEY: z.string().optional().default(''),
  TICKETMASTER_BASE_URL: z.string().default('https://app.ticketmaster.com/discovery/v2'),
  GEMINI_API_KEY: z.string().optional().default(''),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables.');
}

export const env = _env.data;
