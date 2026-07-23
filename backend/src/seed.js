import mongoose from 'mongoose';
import env from './config/env.js';

import User from './models/user.model.js';
import Badge from './models/badge.model.js';
import Quest from './models/quest.model.js';
import LevelConfig from './models/levelConfig.model.js';

const ADMIN_EMAIL = 'admin@boyztrade.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin';

export const seedQuestsAndBadges = async () => {
  try {
    await mongoose.connect(env.mongoUri, { autoIndex: true });
    console.log('MongoDB connected');

    // Seed level configs
    async function seedLevelConfigs() {
      const defaultLevels = [
        { level: 1, title: 'Beginner', xpRequired: 0, rewards: { features: ['basic_trading'] } },
        { level: 2, title: 'Rookie Trader', xpRequired: 100, rewards: { features: ['advanced_charting'] } },
        { level: 3, title: 'Market Explorer', xpRequired: 300, rewards: { features: ['stop_loss'] } },
        { level: 4, title: 'Analyst', xpRequired: 700, rewards: { features: ['margin_trading'] } },
        { level: 5, title: 'Swing Trader', xpRequired: 1500, rewards: { features: ['limit_orders'] } },
        { level: 6, title: 'Pro Trader', xpRequired: 3000, rewards: { features: ['api_access'] } },
      ];
      for (const lvl of defaultLevels) {
        await LevelConfig.findOneAndUpdate({ level: lvl.level }, lvl, { upsert: true, new: true });
      }
      console.log('[Seed] Level configs synced');
    }
    await seedLevelConfigs();


    // Seed badges.
    async function seedBadges() {
      const defaultBadges = [
        { name: 'First Trade', description: 'Complete your first trade', icon: '🎯', category: 'trade', requirement: { type: 'totalTrades', value: 1 }, xpReward: 20, rarity: 'common' },
        { name: 'Trade Apprentice', description: 'Complete 10 trades', icon: '📊', category: 'trade', requirement: { type: 'totalTrades', value: 10 }, xpReward: 50, rarity: 'common' },
        { name: 'Trade Master', description: 'Complete 100 trades', icon: '💼', category: 'trade', requirement: { type: 'totalTrades', value: 100 }, xpReward: 200, rarity: 'rare' },
        { name: 'Profit Seeker', description: 'Complete 5 profitable trades', icon: '💰', category: 'profit', requirement: { type: 'profitableTrades', value: 5 }, xpReward: 50, rarity: 'common' },
        { name: 'Win Streak', description: 'Complete 25 profitable trades', icon: '🏆', category: 'profit', requirement: { type: 'profitableTrades', value: 25 }, xpReward: 150, rarity: 'uncommon' },
        { name: 'Profit Legend', description: 'Complete 100 profitable trades', icon: '👑', category: 'profit', requirement: { type: 'profitableTrades', value: 100 }, xpReward: 500, rarity: 'legendary' },
        { name: 'Streak Starter', description: 'Maintain a 3-day login streak', icon: '🔥', category: 'streak', requirement: { type: 'currentStreak', value: 3 }, xpReward: 30, rarity: 'common' },
        { name: 'Streak Devotee', description: 'Maintain a 7-day login streak', icon: '🔥', category: 'streak', requirement: { type: 'currentStreak', value: 7 }, xpReward: 100, rarity: 'uncommon' },
        { name: 'Streak Legend', description: 'Maintain a 30-day login streak', icon: '💎', category: 'streak', requirement: { type: 'currentStreak', value: 30 }, xpReward: 500, rarity: 'legendary' },
        { name: 'Level Up', description: 'Reach level 3', icon: '⭐', category: 'level', requirement: { type: 'level', value: 3 }, xpReward: 75, rarity: 'common' },
        { name: 'Market Analyst', description: 'Reach level 5', icon: '📈', category: 'level', requirement: { type: 'level', value: 5 }, xpReward: 200, rarity: 'rare' },
        { name: 'Pro Trader', description: 'Reach level 6', icon: '🚀', category: 'level', requirement: { type: 'level', value: 6 }, xpReward: 500, rarity: 'epic' },
        { name: 'Stop Loss Pro', description: 'Use stop loss 5 times', icon: '🛡️', category: 'trade', requirement: { type: 'stopLossUsed', value: 5 }, xpReward: 50, rarity: 'uncommon' },
        { name: 'Century Club', description: 'Earn 1000 XP', icon: '💯', category: 'milestone', requirement: { type: 'xp', value: 1000 }, xpReward: 100, rarity: 'uncommon' },
        { name: 'XP Hunter', description: 'Earn 5000 XP', icon: '⚡', category: 'milestone', requirement: { type: 'xp', value: 5000 }, xpReward: 300, rarity: 'epic' },
      ];
      const count = await Badge.countDocuments();
      if (count > 0) return;
      await Badge.insertMany(defaultBadges);
      console.log('[Seed] Badges inserted');
    }
    await seedBadges();


    // Seed quests
    async function seedQuests() {
      const defaultQuests = [
        { name: 'Daily Trader', description: 'Complete 3 trades today', icon: '📊', type: 'daily', requirement: { type: 'dailyTrades', value: 3 }, xpReward: 30, isRepeatable: true },
        { name: 'Profit Hunter', description: 'Earn $100 P&L today', icon: '💰', type: 'daily', requirement: { type: 'totalPnl', value: 100 }, xpReward: 50, isRepeatable: true },
        { name: 'Trade Sprint', description: 'Complete 5 trades today', icon: '⚡', type: 'daily', requirement: { type: 'dailyTrades', value: 5 }, xpReward: 50, isRepeatable: true },
        { name: 'Profit Surge', description: 'Earn $500 P&L today', icon: '💎', type: 'daily', requirement: { type: 'totalPnl', value: 500 }, xpReward: 100, isRepeatable: true },
        { name: 'Weekly Warrior', description: 'Complete 10 trades this week', icon: '⚔️', type: 'weekly', requirement: { type: 'totalTrades', value: 10 }, xpReward: 100, isRepeatable: true },
        { name: 'Weekly Profit', description: 'Earn $500 P&L this week', icon: '💵', type: 'weekly', requirement: { type: 'totalPnl', value: 500 }, xpReward: 200, isRepeatable: true },
        { name: 'Streak Keeper', description: 'Maintain a 5-day login streak', icon: '🔥', type: 'milestone', requirement: { type: 'currentStreak', value: 5 }, xpReward: 75 },
        { name: 'Century Trader', description: 'Complete 100 total trades', icon: '🏅', type: 'milestone', requirement: { type: 'totalTrades', value: 100 }, xpReward: 300 },
      ];

      for (const q of defaultQuests) {
        await Quest.findOneAndUpdate({ name: q.name }, q, { upsert: true, new: true });
      }
      console.log('[Seed] Quests synced');
    }
    await seedQuests();

    await mongoose.disconnect();
    console.log('[Seed] Quest and badge seeding completed');
    process.exit(0);

  } catch (error) {
    console.error('Failed to seed Quest and Badges', error);
    process.exit(1);
  }
}


// Seed Admin
export const seedAdmin = async () => {
  try {
    await mongoose.connect(env.mongoUri, { autoIndex: true });
    console.log('MongoDB connected');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin already exists (${ADMIN_EMAIL}), skipping seed.`);
      process.exit(0);
    }

    await User.create({
      email: ADMIN_EMAIL,
      fullName: ADMIN_NAME,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
    });

    await mongoose.disconnect();
    console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};