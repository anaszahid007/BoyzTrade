import UserGamification from '../../models/userGamification.model.js';
import { evaluateBadges } from './badges.js';
import { initializeQuests, updateQuestProgress } from './quests.js';
import { evaluateCareer } from './career.js';

/** Increments the user's trade counters and triggers quest/badge/career evaluation. */
export const addTradeStats = async (userId, realizedPnL) => {
  const profile = await UserGamification.findOrCreate(userId);
  profile.totalTrades += 1;
  if (realizedPnL > 0) {
    profile.profitableTrades += 1;
  }
  await profile.save();

  await initializeQuests(userId);
  await evaluateBadges(userId);
  await evaluateCareer(userId, profile);
  await updateQuestProgress(userId, 'dailyTrades', 1);
  if (realizedPnL > 0) {
    await updateQuestProgress(userId, 'totalPnl', realizedPnL);
  }

  return profile;
};
