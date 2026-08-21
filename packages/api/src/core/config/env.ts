import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

const envSchema = z.object({
  PORT: z.coerce.number().default(process.env.PORT ? Number(process.env.PORT) : 3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default(isTest ? 'test' : 'development'),
  DATABASE_URL: isTest
    ? z.string().default('postgresql://postgres:postgres@localhost:5432/passfy_test?schema=public')
    : z.string().min(1, 'DATABASE_URL is required. Set DATABASE_URL in your Railway / hosting dashboard.'),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: isTest
    ? z.string().default('test_jwt_secret_key_for_automated_tests_only_passfy')
    : z
        .string()
        .min(16, 'JWT_SECRET must be at least 16 characters for cryptographic safety.')
        .default('super_secret_passfy_jwt_key_production_change_in_dashboard'),
  QR_SECRET_KEY: isTest
    ? z.string().default('test_qr_cryptographic_secret_key_hmac_sha256_at_least_32_chars_passfy')
    : z
        .string()
        .min(32, 'QR_SECRET_KEY must be a strong secret of at least 32 characters.')
        .default('passfy_cryptographic_qr_signing_key_hmac_sha256_secret_production'),
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
  throw new Error('Server cannot start: Missing or invalid environment variables. Check .env or Railway configuration.');
}

export const env = _env.data;



