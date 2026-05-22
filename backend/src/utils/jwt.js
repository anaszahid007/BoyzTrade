import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change-me-access';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change-me-refresh';
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d';

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
