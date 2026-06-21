import { authService } from '../modules/auth/auth.service.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Verifies the access token from the Authorization header and attaches a
 * minimal `req.user` ({ id, email }) for downstream handlers. Express 4
 * automatically forwards synchronous throws from middleware to the error
 * handler, so verifyAccessToken() throwing ApiError directly (rather than
 * needing an explicit next(err) here) is intentional, not an oversight.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();
  const payload = authService.verifyAccessToken(token);

  req.user = { id: payload.sub, email: payload.email };
  next();
}