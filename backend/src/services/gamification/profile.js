import UserGamification from '../../models/userGamification.model.js';
import LevelConfig from '../../models/levelConfig.model.js';
import { emitToUser } from '../../socket.js';
import { evaluateBadges } from './badges.js';
import { evaluateCareer, getCareerPath } from './career.js';

/** Finds or creates a gamification profile for the given user. */
export const getOrCreateProfile = async (userId) => {
  return UserGamification.findOrCreate(userId);
};

/** Retrieves the full gamification profile with level boundary info. */
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
      streakMilestones: [
        { days: 3, xp: 50, label: '3-Day Streak', reached: profile.currentStreak >= 3, progress: Math.min(100, (profile.currentStreak / 3) * 100) },
        { days: 7, xp: 100, label: '7-Day Streak', reached: profile.currentStreak >= 7, progress: Math.min(100, (profile.currentStreak / 7) * 100) },
        { days: 30, xp: 500, label: '30-Day Streak', reached: profile.currentStreak >= 30, progress: Math.min(100, (profile.currentStreak / 30) * 100) },
      ],
    totalTrades: profile.totalTrades,
    profitableTrades: profile.profitableTrades,
    stopLossUsed: profile.stopLossUsed,
    lessonsCompleted: profile.lessonsCompleted,
    challengesCompleted: profile.challengesCompleted,
    careerStage: profile.careerStage,
    careerTitle: profile.careerTitle,
    virtualSalary: profile.virtualSalary,
    careerPath: await getCareerPath(userId),
    unlockedFeatures: profile.unlockedFeatures,
  };
};

/** Awards XP to a user, checks for level-up, and emits an update. */
export const awardXP = async (userId, amount, source = 'unknown') => {
  const profile = await getOrCreateProfile(userId);
  profile.xp += amount;
  await profile.save();
  await checkLevelUp(userId, profile);
  emitGamificationUpdate(userId);
  return profile;
};

/** Checks if the user has enough XP to level up and applies the level-up if so. */
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

    await evaluateCareer(userId, profile);
    emitGamificationUpdate(userId);

    await checkLevelUp(userId, profile);
    await evaluateBadges(userId);
    return true;
  }

  return false;
};

/** Emits a gamification-update socket event to the user with their latest profile data. */
export const emitGamificationUpdate = async (userId) => {
  try {
    const data = await getProfile(userId);
    emitToUser(userId, 'gamification-update', data);
  } catch {
    // silent
  }
};
