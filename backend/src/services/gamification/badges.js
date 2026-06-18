import Badge from '../../models/badge.model.js';
import UserBadge from '../../models/userBadge.model.js';
import UserGamification from '../../models/userGamification.model.js';
import { emitToUser } from '../../socket.js';
import { awardXP } from './profile.js';

/** Checks all active badges against the user's profile and awards any that are newly earned. */
export const evaluateBadges = async (userId) => {
  try {
    const profile = await UserGamification.findOrCreate(userId);
    const allBadges = await Badge.find({ isActive: true });
    const earnedBadges = await UserBadge.find({ userId }).populate('badgeId');
    const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badgeId?._id?.toString()));

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge._id.toString())) continue;

      let earned = false;
      const reqType = badge.requirement.type;
      const reqValue = badge.requirement.value;

      switch (reqType) {
        case 'totalTrades':
          earned = profile.totalTrades >= reqValue;
          break;
        case 'profitableTrades':
          earned = profile.profitableTrades >= reqValue;
          break;
        case 'currentStreak':
          earned = profile.currentStreak >= reqValue;
          break;
        case 'level':
          earned = profile.level >= reqValue;
          break;
        case 'xp':
          earned = profile.xp >= reqValue;
          break;
        case 'stopLossUsed':
          earned = profile.stopLossUsed >= reqValue;
          break;
        case 'lessonsCompleted':
          earned = profile.lessonsCompleted >= reqValue;
          break;
        case 'challengesCompleted':
          earned = profile.challengesCompleted >= reqValue;
          break;
      }

      if (earned) {
        await awardBadge(userId, badge);
      }
    }
  } catch {
    // silent
  }
};

/** Awards a specific badge to the user, grants XP reward, and emits a badge-earned event. */
export const awardBadge = async (userId, badge) => {
  try {
    const existing = await UserBadge.findOne({ userId, badgeId: badge._id });
    if (existing) return;

    await UserBadge.create({ userId, badgeId: badge._id });

    if (badge.xpReward > 0) {
      await awardXP(userId, badge.xpReward, `badge_${badge.name}`);
    }

    const badgeData = {
      _id: badge._id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      xpReward: badge.xpReward,
      earnedAt: new Date(),
    };

    emitToUser(userId, 'badge-earned', badgeData);
  } catch {
    // silent
  }
};

/** Returns all badges earned by the user, sorted by most recent. */
export const getUserBadges = async (userId) => {
  const userBadges = await UserBadge.find({ userId })
    .populate({ path: 'badgeId' })
    .sort({ earnedAt: -1 })
    .lean();

  return userBadges
    .filter(ub => ub.badgeId)
    .map(ub => ({
      _id: ub.badgeId._id,
      name: ub.badgeId.name,
      description: ub.badgeId.description,
      icon: ub.badgeId.icon,
      category: ub.badgeId.category,
      rarity: ub.badgeId.rarity,
      xpReward: ub.badgeId.xpReward,
      earnedAt: ub.earnedAt,
    }));
};

/** Returns all active badges with a flag indicating whether the user has earned each one. */
export const getAllBadgesWithStatus = async (userId) => {
  const allBadges = await Badge.find({ isActive: true }).sort({ category: 1, requirement: { type: 1, value: 1 } }).lean();
  const earnedBadges = await UserBadge.find({ userId }).lean();
  const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badgeId.toString()));

  return allBadges.map(badge => ({
    _id: badge._id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    category: badge.category,
    rarity: badge.rarity,
    xpReward: badge.xpReward,
    requirement: badge.requirement,
    earned: earnedBadgeIds.has(badge._id.toString()),
  }));
};
