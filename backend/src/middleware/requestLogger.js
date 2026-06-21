import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Assigns a unique requestId to every request and logs method/path/status/
 * duration on completion. The requestId is also echoed back in a response
 * header so a user-reported issue can be traced to exact log lines —
 * including, later, AI generation attempts tied to that same request.
 */
export function requestLogger(req, res, next) {
  req.requestId = randomUUID();
  const start = Date.now();

  res.setHeader('X-Request-Id', req.requestId);

  res.on('finish', () => {
    logger.info(
      {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        userId: req.user?.id,
      },
      'request completed'
    );
  });

  next();
}