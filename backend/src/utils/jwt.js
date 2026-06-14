import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const JWT_ACCESS_SECRET = env.jwt.access.secret || 'change-me-access';
const JWT_REFRESH_SECRET = env.jwt.refresh.secret || 'change-me-refresh';
const JWT_ACCESS_EXPIRES = env.jwt.access.expiresIn || '7d';
const JWT_REFRESH_EXPIRES = env.jwt.refresh.expiresIn || '30d';

/**
 * Sign an access token
 * @param {Object} payload
 */
export const signAccessToken = (payload) =>
  jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES });

/**
 * Sign a refresh token
 * @param {Object} payload
 */
export const signRefreshToken = (payload) =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });

/**
 * Verify access token
 */
export const verifyAccessToken = (token) =>
  jwt.verify(token, JWT_ACCESS_SECRET);

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) =>
  jwt.verify(token, JWT_REFRESH_SECRET);

export default { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
