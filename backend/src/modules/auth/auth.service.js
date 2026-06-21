import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../user/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';

const BCRYPT_COST_FACTOR = 12;

function generateAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

function generateRefreshToken(user) {
  // The token carries the user's *current* refreshTokenVersion at issuance
  // time. On every refresh attempt we compare this against the user's
  // live version in the database — see refreshAccessToken() below.
  return jwt.sign(
    { sub: user._id.toString(), version: user.refreshTokenVersion },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwt.accessSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.jwt.refreshSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
}

function issueTokenPair(user) {
  return {
    user,
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);
  const user = await User.create({ name, email, passwordHash });

  return issueTokenPair(user);
}

async function login({ email, password }) {
  // passwordHash has `select: false` on the schema, so it must be
  // explicitly requested here — this is the one place in the app allowed
  // to see it.
  const user = await User.findOne({ email }).select('+passwordHash');

  // Deliberately the SAME error and status for "no such user" and "wrong
  // password". Distinguishing them would let an attacker enumerate which
  // emails have accounts — a small but real information leak.
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  return issueTokenPair(user);
}

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub);

  if (!user) {
    throw ApiError.unauthorized('Account no longer exists');
  }

  // If the token's embedded version doesn't match the user's CURRENT
  // version, it was issued before a logout (or future password-change)
  // event and must be rejected. This is the entire revocation mechanism —
  // no token blacklist/store needed.
  if (payload.version !== user.refreshTokenVersion) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  return issueTokenPair(user);
}

async function logoutByRefreshToken(refreshToken) {
  if (!refreshToken) {
    return; // Nothing to invalidate — logout is idempotent either way.
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    // Bumping the version invalidates this token AND every other
    // outstanding refresh token for this user (e.g. other devices/tabs) —
    // a deliberate "log out everywhere" side effect, not a bug.
    await User.findByIdAndUpdate(payload.sub, { $inc: { refreshTokenVersion: 1 } });
  } catch {
    // Token was already invalid/expired — there's nothing to revoke, and
    // logout should still report success rather than erroring on a token
    // the client clearly can't use anymore anyway.
  }
}

export const authService = {
  register,
  login,
  refreshAccessToken,
  logoutByRefreshToken,
  verifyAccessToken,
};