import UserGamification from '../models/userGamification.model.js';
import LevelConfig from '../models/levelConfig.model.js';
import Badge from '../models/badge.model.js';
import UserBadge from '../models/userBadge.model.js';
import Quest from '../models/quest.model.js';
import UserQuest from '../models/userQuest.model.js';
import { emitToUser } from '../socket.js';

const STREAK_MILESTONES = {
  3: { xp: 50, label: '3-Day Streak' },
  7: { xp: 100, label: '7-Day Streak' },
  30: { xp: 500, label: '30-Day Streak' },
};

export const getOrCreateProfile = async (userId) => {
  return UserGamification.findOrCreate(userId);
};

export const getProfile = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  const nextLevel = await LevelConfig.findOne({ level: profile.level + 1 });
  const currentLevel = await LevelConfig.findOne({ level: profile.level });

  return {
    xp: profile.xp,
    level: profile.level,
    levelTitle: profile.levelTitle,
    xpForNext: nextLevel ? nextLevel.xpRequired : profile.xp,
    xpForCurrent: currentLevel ? currentLevel.xpRequired : 0,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    totalTrades: profile.totalTrades,
    profitableTrades: profile.profitableTrades,
    stopLossUsed: profile.stopLossUsed,
    lessonsCompleted: profile.lessonsCompleted,
    challengesCompleted: profile.challengesCompleted,
    careerStage: profile.careerStage,
    careerTitle: profile.careerTitle,
    virtualSalary: profile.virtualSalary,
    unlockedFeatures: profile.unlockedFeatures,
  };
};

export const awardXP = async (userId, amount, source = 'unknown') => {
  const profile = await getOrCreateProfile(userId);
  profile.xp += amount;
  await profile.save();
  await checkLevelUp(userId, profile);
  emitGamificationUpdate(userId);
  return profile;
};

export const checkLevelUp = async (userId, profile) => {
  if (!profile) {
    profile = await getOrCreateProfile(userId);
  }

  const nextLevel = await LevelConfig.findOne({ level: profile.level + 1 });
  if (!nextLevel) return false;

  if (profile.xp >= nextLevel.xpRequired) {
    profile.level = nextLevel.level;
    profile.levelTitle = nextLevel.title;

    for (const feature of nextLevel.rewards.features || []) {
      if (!profile.unlockedFeatures.includes(feature)) {
        profile.unlockedFeatures.push(feature);
      }
    }

    await profile.save();
    emitGamificationUpdate(userId);

    await checkLevelUp(userId, profile);
    await evaluateBadges(userId);
    return true;
  }

  return false;
};

export const updateStreak = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastLogin = profile.lastLoginDate ? new Date(profile.lastLoginDate) : null;
  if (!lastLogin) {
    profile.currentStreak = 1;
    profile.longestStreak = 1;
  } else {
    const lastMidnight = new Date(lastLogin);
    lastMidnight.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastMidnight) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      await profile.save();
      return profile;
    } else if (diffDays === 1) {
      profile.currentStreak += 1;
      if (profile.currentStreak > profile.longestStreak) {
        profile.longestStreak = profile.currentStreak;
      }
      const milestone = STREAK_MILESTONES[profile.currentStreak];
      if (milestone) {
        profile.xp += milestone.xp;
        await profile.save();
        await checkLevelUp(userId, profile);
      }
    } else {
      profile.currentStreak = 1;
    }
  }

  profile.lastLoginDate = today;
  await profile.save();
  emitGamificationUpdate(userId);

  await evaluateBadges(userId);
  await initializeQuests(userId);

  return profile;
};

export const addTradeStats = async (userId, realizedPnL) => {
  const profile = await getOrCreateProfile(userId);
  profile.totalTrades += 1;
  if (realizedPnL > 0) {
    profile.profitableTrades += 1;
  }
  await profile.save();

  await initializeQuests(userId);
  await evaluateBadges(userId);
  await updateQuestProgress(userId, 'dailyTrades', 1);
  if (realizedPnL > 0) {
    await updateQuestProgress(userId, 'totalPnl', realizedPnL);
  }

  return profile;
};

// ─── Badge System ───────────────────────────────────────────────

export const evaluateBadges = async (userId) => {
  try {
    const profile = await getOrCreateProfile(userId);
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

// ─── Quest System ───────────────────────────────────────────────

export const initializeQuests = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const activeQuests = await Quest.find({ isActive: true });

    for (const quest of activeQuests) {
      let periodStart = null;
      let periodEnd = null;

      if (quest.type === 'daily') {
        periodStart = new Date(today);
        periodEnd = new Date(today);
        periodEnd.setDate(periodEnd.getDate() + 1);
      } else if (quest.type === 'weekly') {
        periodStart = new Date(weekStart);
        periodEnd = new Date(weekStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
      }

      const existing = await UserQuest.findOne({
        userId,
        questId: quest._id,
        periodStart,
      });

      if (!existing) {
        await UserQuest.create({
          userId,
          questId: quest._id,
          progress: 0,
          completed: false,
          claimed: false,
          periodStart,
          periodEnd,
        });
      }
    }
  } catch {
    // silent
  }
};

export const updateQuestProgress = async (userId, type, increment = 1) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const matchingQuests = await Quest.find({
      isActive: true,
      'requirement.type': type,
    });

    for (const quest of matchingQuests) {
      let periodStart;
      if (quest.type === 'daily') {
        periodStart = today;
      } else if (quest.type === 'weekly') {
        periodStart = weekStart;
      } else {
        periodStart = null;
      }

      let userQuest;
      if (periodStart) {
        userQuest = await UserQuest.findOne({
          userId,
          questId: quest._id,
          periodStart,
        });
      } else {
        userQuest = await UserQuest.findOne({
          userId,
          questId: quest._id,
        });
      }

      if (!userQuest || userQuest.completed) continue;

      userQuest.progress += Math.round(increment * 100) / 100;

      if (userQuest.progress >= quest.requirement.value) {
        userQuest.progress = quest.requirement.value;
        userQuest.completed = true;
        userQuest.completedAt = new Date();
      }

      await userQuest.save();

      if (userQuest.completed) {
        emitToUser(userId, 'quest-completed', {
          _id: userQuest._id,
          questId: quest._id,
          name: quest.name,
          description: quest.description,
          icon: quest.icon,
          xpReward: quest.xpReward,
        });
      }

      emitQuestUpdate(userId);
    }
  } catch {
    // silent
  }
};

export const claimQuest = async (userId, userQuestId) => {
  const userQuest = await UserQuest.findOne({ _id: userQuestId, userId }).populate('questId');
  if (!userQuest) throw new Error('Quest not found');
  if (!userQuest.completed) throw new Error('Quest not completed');
  if (userQuest.claimed) throw new Error('Quest already claimed');

  userQuest.claimed = true;
  userQuest.claimedAt = new Date();
  await userQuest.save();

  if (userQuest.questId.xpReward > 0) {
    await awardXP(userId, userQuest.questId.xpReward, `quest_${userQuest.questId.name}`);
  }

  emitQuestUpdate(userId);
  return userQuest;
};

export const getUserQuests = async (userId) => {
  const userQuests = await UserQuest.find({ userId })
    .populate({ path: 'questId' })
    .sort({ createdAt: -1 })
    .lean();

  return userQuests
    .filter(uq => uq.questId)
    .map(uq => ({
      _id: uq._id,
      questId: uq.questId._id,
      name: uq.questId.name,
      description: uq.questId.description,
      icon: uq.questId.icon,
      type: uq.questId.type,
      xpReward: uq.questId.xpReward,
      requirement: uq.questId.requirement,
      progress: uq.progress,
      completed: uq.completed,
      completedAt: uq.completedAt,
      claimed: uq.claimed,
      claimedAt: uq.claimedAt,
      periodStart: uq.periodStart,
      periodEnd: uq.periodEnd,
    }));
};

// ─── Admin Badge/Quest Management ───────────────────────────────

export const createBadge = async (data) => {
  return Badge.create(data);
};

export const updateBadge = async (badgeId, data) => {
  const badge = await Badge.findByIdAndUpdate(badgeId, data, { new: true });
  if (!badge) throw new Error('Badge not found');
  return badge;
};

export const deleteBadge = async (badgeId) => {
  const badge = await Badge.findByIdAndDelete(badgeId);
  if (!badge) throw new Error('Badge not found');
  return badge;
};

export const listBadges = async () => {
  return Badge.find().sort({ category: 1, createdAt: -1 }).lean();
};

export const createQuest = async (data) => {
  return Quest.create(data);
};

export const updateQuest = async (questId, data) => {
  const quest = await Quest.findByIdAndUpdate(questId, data, { new: true });
  if (!quest) throw new Error('Quest not found');
  return quest;
};

export const deleteQuest = async (questId) => {
  const quest = await Quest.findByIdAndDelete(questId);
  if (!quest) throw new Error('Quest not found');
  return quest;
};

export const listQuests = async () => {
  return Quest.find().sort({ type: 1, createdAt: -1 }).lean();
};

// ─── Leaderboard ────────────────────────────────────────────────

export const getLeaderboard = async (type = 'xp', limit = 20) => {
  const sortField = type === 'xp' ? 'xp' : type === 'streak' ? 'currentStreak' : 'totalTrades';
  const profiles = await UserGamification.find()
    .sort({ [sortField]: -1 })
    .limit(limit)
    .populate({ path: 'userId', select: 'fullName email' });

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

export const emitGamificationUpdate = async (userId) => {
  try {
    const data = await getProfile(userId);
    emitToUser(userId, 'gamification-update', data);
  } catch {
    // silent
  }
};

const emitQuestUpdate = async (userId) => {
  try {
    const data = await getUserQuests(userId);
    emitToUser(userId, 'quests-update', data);
  } catch {
    // silent
  }
};

export default {
  getOrCreateProfile,
  getProfile,
  awardXP,
  checkLevelUp,
  updateStreak,
  addTradeStats,
  getLeaderboard,
  emitGamificationUpdate,
  evaluateBadges,
  awardBadge,
  getUserBadges,
  getAllBadgesWithStatus,
  initializeQuests,
  updateQuestProgress,
  claimQuest,
  getUserQuests,
  createBadge,
  updateBadge,
  deleteBadge,
  listBadges,
  createQuest,
  updateQuest,
  deleteQuest,
  listQuests,
};
