import jwt from 'jsonwebtoken';
import env from '../config/env.js';

if (!env.jwt.access.secret) throw new Error('JWT_ACCESS_SECRET is not configured');
if (!env.jwt.refresh.secret) throw new Error('JWT_REFRESH_SECRET is not configured');

const JWT_ACCESS_SECRET = env.jwt.access.secret;
const JWT_REFRESH_SECRET = env.jwt.refresh.secret;
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
