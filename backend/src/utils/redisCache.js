import redisClient from "../config/redis.js";

/** Shared cache TTLs (seconds) — keep in sync with broadcast interval */
export const CACHE_TTL = {
    MARKET_ASSETS: 120,       // 2 min — market list prices
    ASSET_DETAIL: 60,        // 1 min — single asset with live price
    ASSET_SEARCH: 60 * 60,   // 1 hour — static coin metadata from search
};

export const BROADCAST_INTERVAL_MS = CACHE_TTL.MARKET_ASSETS * 1000;

/**
 * Get a JSON-serialized value from Redis.
 * Returns null on cache miss or Redis errors.
 */
export const getCachedValue = async (key) => {
    try {
        const value = await redisClient.get(key);
        if (!value) return null;
        return JSON.parse(value);
    } catch (error) {
        console.warn(`Redis GET failed for ${key}:`, error.message);
        return null;
    }
};

/**
 * Store a value in Redis as JSON with an expiration (seconds).
 */
export const setCachedValue = async (key, value, ttlSeconds) => {
    try {
        await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
        console.warn(`Redis SET failed for ${key}:`, error.message);
    }
};
