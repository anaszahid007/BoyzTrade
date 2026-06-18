import UserGamification from '../../models/userGamification.model.js';

/** Returns a ranked list of non-admin users sorted by XP, streak, or total trades. */
export const getLeaderboard = async (type = 'xp', limit = 20) => {
  const sortField = type === 'xp' ? 'xp' : type === 'streak' ? 'currentStreak' : 'totalTrades';
  let profiles = await UserGamification.find()
    .sort({ [sortField]: -1 })
    .limit(limit * 2)
    .populate({ path: 'userId', select: 'fullName email role' });

  profiles = profiles.filter(p => p.userId?.role !== 'admin').slice(0, limit);

  return profiles.map((p, i) => ({
    rank: i + 1,
    userId: p.userId?._id,
    fullName: p.userId?.fullName || 'Anonymous',
    email: p.userId?.email,
    xp: p.xp,
    level: p.level,
    levelTitle: p.levelTitle,
    currentStreak: p.currentStreak,
    totalTrades: p.totalTrades,
  }));
};
