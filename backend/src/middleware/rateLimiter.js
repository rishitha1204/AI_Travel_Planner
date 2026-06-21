import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

// General-purpose limiter applied to every request, keyed by IP.
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many requests, please try again shortly'));
  },
});

// Stricter limiter for login/register specifically — these are the routes
// most attractive to brute-force/credential-stuffing and account-creation
// spam, so they get a tighter window than the general API limiter above.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many attempts, please try again later'));
  },
});

// Stricter, per-user limiter reserved for Gemini-touching routes (itinerary
// generation, health score computation) added in later phases. Keyed by
// authenticated user id rather than IP, since the cost we're bounding here
// is per-account API spend, not per-IP traffic.
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('AI usage limit reached for this hour, please try again later'));
  },
});