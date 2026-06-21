import pino from 'pino';
import { env } from '../config/env.js';

// Redact anything that could leak a credential into logs, even if a field
// gets added later by someone who forgets this list exists.
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  '*.password',
  '*.passwordHash',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.apiKey',
];

export const logger = pino({
  level: env.isProduction ? 'info' : 'debug',
  redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
  transport: env.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      },
});