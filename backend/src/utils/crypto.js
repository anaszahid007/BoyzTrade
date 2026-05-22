import { randomBytes, createHash } from 'crypto';

/**
 * Generate a secure random token string
 * @param {number} size
 */
export const generateRandomToken = (size = 48) => randomBytes(size).toString('hex');

/**
 * Hash a token (sha256) for safe storage and comparison
 * @param {string} token
 */
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export default { generateRandomToken, hashToken };
