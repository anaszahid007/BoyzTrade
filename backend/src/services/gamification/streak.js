import UserGamification from '../../models/userGamification.model.js';
import { emitToUser } from '../../socket.js';
import { checkLevelUp, emitGamificationUpdate } from './profile.js';
import { evaluateBadges } from './badges.js';
import { initializeQuests } from './quests.js';

const STREAK_MILESTONES = {
  3: { xp: 50, label: '3-Day Streak' },
  7: { xp: 100, label: '7-Day Streak' },
  30: { xp: 500, label: '30-Day Streak' },
};

/** Updates the user's login streak, awards milestone XP, and triggers badge/quest init. */
export const updateStreak = async (userId) => {
  const profile = await UserGamification.findOrCreate(userId);
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
