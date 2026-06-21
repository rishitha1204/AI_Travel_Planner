import { authService } from './auth.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { env } from '../../config/env.js';
import { parseDurationToMs } from '../../utils/parseDuration.js';
import { User } from '../user/user.model.js';
import { ApiError } from '../../utils/ApiError.js';

const REFRESH_COOKIE_NAME = 'refreshToken';
// Scoping the cookie's path to /api/auth means the browser only ever
// attaches it to auth endpoints (refresh, logout) — it's never sent
// alongside unrelated requests like /api/trips, shrinking its exposure.
const REFRESH_COOKIE_PATH = '/api/auth';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
  };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...refreshCookieOptions(),
    maxAge: parseDurationToMs(env.jwt.refreshExpiresIn),
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
}

export const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ success: true, data: { user, accessToken } });
});

export const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(200).json({ success: true, data: { user, accessToken } });
});

export const refresh = catchAsync(async (req, res) => {
  const incomingRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const { user, accessToken, refreshToken } = await authService.refreshAccessToken(incomingRefreshToken);
  setRefreshCookie(res, refreshToken);
  res.status(200).json({ success: true, data: { user, accessToken } });
});

export const logout = catchAsync(async (req, res) => {
  const incomingRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  await authService.logoutByRefreshToken(incomingRefreshToken);
  clearRefreshCookie(res);
  res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
});

export const me = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  res.status(200).json({ success: true, data: { user } });
});