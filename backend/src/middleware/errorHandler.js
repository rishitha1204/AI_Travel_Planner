import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// Catches any request that didn't match a route and converts it into a
// standard ApiError so it flows through the same error handler as everything
// else, instead of Express's default plain-text 404.
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// The single place in the app that turns any thrown/forwarded error into an
// HTTP response. Operational errors (ApiError with isOperational=true) return
// their real message; anything else is logged loudly and masked from the
// client to avoid leaking internals (stack traces, library error text).
export function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : 'Something went wrong on our end';

  if (!isApiError || !err.isOperational) {
    logger.error({ err, requestId: req.requestId }, 'Unhandled error');
  } else {
    logger.warn({ requestId: req.requestId, statusCode, message: err.message }, 'Operational error');
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: isApiError ? err.constructor.name : 'INTERNAL_ERROR',
      message,
      details: isApiError ? err.details : undefined,
      ...(env.isProduction ? {} : { stack: err.stack }),
    },
  });
}