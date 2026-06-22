import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import tripRoutes from './modules/trip/trip.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import healthScoreRoutes from './modules/healthScore/healthScore.routes.js';

/**
 * Builds and returns the configured Express app. Kept as a factory function
 * (rather than a top-level app instance) so tests can spin up isolated app
 * instances without binding a port — server.js is the only place that calls
 * .listen().
 *
 * Feature routes (auth, trips, AI, health score) are mounted in later
 * phases; this phase only wires the cross-cutting middleware pipeline and a
 * health check, which is everything needed to confirm the server boots
 * correctly end-to-end before any business logic exists.
 */
export function createApp() {
  const app = express();

  // Required for correct client IPs and secure cookies when deployed behind
  // a reverse proxy (Render, Railway, Vercel, etc.) — without this, rate
  // limiting and secure-cookie handling would misbehave in production.
  app.set('trust proxy', 1);

  app.use(helmet());
  const allowedOrigins = [
    env.clientOrigin,
    'https://rishitha1204.github.io',
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(requestLogger);
  app.use(generalLimiter);

  // Health check endpoint — used by uptime monitors and deployment platforms
  // to confirm the process is alive (and, indirectly, that env validation
  // and the middleware pipeline above didn't throw on boot).
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/trips', aiRoutes);
  app.use('/api/trips', healthScoreRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}