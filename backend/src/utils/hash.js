import argon2 from 'argon2';

/**
 * Hash a value using Argon2 (for tokens before storage)
 * @param {string} value
 */
export const hashValue = async (value) => argon2.hash(value);

/**
 * Verify a value against an Argon2 hash
 * @param {string} hash
 * @param {string} value
 */
export const verifyHash = async (hash, value) => argon2.verify(hash, value);

export default { hashValue, verifyHash };
