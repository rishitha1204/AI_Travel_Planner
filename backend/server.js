import { createApp } from './src/app.js';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';

async function start() {
  await connectDB();

  const app = createApp();

  const server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });

  // Graceful shutdown: stop accepting new connections, let in-flight
  // requests finish, then exit. Matters for zero-downtime deploys and for
  // not killing an in-progress Gemini call mid-response in later phases.
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Last line of defense: log unhandled promise rejections instead of
  // letting them fail silently or crash the process without explanation.
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });
}

start();