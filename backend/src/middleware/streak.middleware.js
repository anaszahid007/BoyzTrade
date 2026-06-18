import UserGamification from '../models/userGamification.model.js';
import { updateStreak } from '../services/gamification/streak.js';

/**
 * In-memory cache tracking when each user was last checked.
 * Key: userId string, Value: date string (YYYY-MM-DD) of last check.
 * Prevents excessive DB reads on rapid successive requests.
 */
const lastCheckCache = new Map();

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Express middleware that checks and updates the user's daily login streak
 * on every authenticated request.  If the user's `lastLoginDate` is before
 * today, `updateStreak` is called asynchronously (fire-and-forget) so it
 * never blocks the response.
 *
 * An in-memory cache ensures we only re-check once per hour per user.
 */
export async function streakMiddleware(req, res, next) {
  if (!req.user) return next();

  const userId = req.user._id.toString();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  // Skip if already checked today (cached)
  const cached = lastCheckCache.get(userId);
  if (cached === todayStr) return next();

  // Check lastLoginDate — only update if it's before today
  try {
    const profile = await UserGamification.findOne({ userId }).select('lastLoginDate').lean();
    if (!profile || !profile.lastLoginDate) {
      // First time — update streak asynchronously
      updateStreak(userId).catch(() => {});
      lastCheckCache.set(userId, todayStr);
      return next();
    }

    const lastLogin = new Date(profile.lastLoginDate);
    lastLogin.setHours(0, 0, 0, 0);

    if (lastLogin < today) {
      updateStreak(userId).catch(() => {});
    }

    lastCheckCache.set(userId, todayStr);
  } catch {
    // silent — do not break the request
  }

  next();
}

// Cleanup stale cache entries periodically (every 30 min)
setInterval(() => {
  for (const [key] of lastCheckCache) {
    if (lastCheckCache.get(key) && lastCheckCache.get(key) !== new Date().toISOString().slice(0, 10)) {
      lastCheckCache.delete(key);
    }
  }
}, 30 * 60 * 1000);

export default streakMiddleware;
