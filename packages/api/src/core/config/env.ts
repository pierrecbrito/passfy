import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z
    .string()
    .default(
      process.env.DATABASE_URL ||
        'postgresql://postgres.lqukhxcyuwupvqiexwwx:P13rr3Br1t0%21%40%23@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
    ),
  DIRECT_URL: z
    .string()
    .default(
      process.env.DIRECT_URL ||
        'postgresql://postgres.lqukhxcyuwupvqiexwwx:P13rr3Br1t0%21%40%23@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
    ),
  JWT_SECRET: z.string().default('super_secret_passfy_jwt_key_development_only_change_in_production'),
  QR_SECRET_KEY: z.string().default('passfy_cryptographic_qr_signing_key_hmac_sha256_secret'),
  CORS_ORIGIN: z.string().default('*'),
  TICKETMASTER_API_KEY: z.string().optional().default(''),
  TICKETMASTER_BASE_URL: z.string().default('https://app.ticketmaster.com/discovery/v2'),
  GEMINI_API_KEY: z.string().optional().default(''),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables.');
}

export const env = _env.data;
