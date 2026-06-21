import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Every variable the server needs to run is validated here, once, at boot.
// If anything is missing or malformed, the process exits immediately instead
// of failing later on a random request (e.g. the first login attempt).
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

const data = parsed.data;

export const env = {
  nodeEnv: data.NODE_ENV,
  port: Number(data.PORT),
  mongoUri: data.MONGO_URI,
  jwt: {
    accessSecret: data.JWT_ACCESS_SECRET,
    refreshSecret: data.JWT_REFRESH_SECRET,
    accessExpiresIn: data.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: data.JWT_REFRESH_EXPIRES_IN,
  },
  gemini: {
    apiKey: data.GEMINI_API_KEY,
    model: data.GEMINI_MODEL,
  },
  clientOrigin: data.CLIENT_ORIGIN,
  isProduction: data.NODE_ENV === 'production',
};