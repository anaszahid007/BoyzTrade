import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const BadgeSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: {
    type: String,
    enum: ['trade', 'streak', 'level', 'profit', 'social', 'milestone'],
    default: 'milestone',
  },
  requirement: {
    type: { type: String, enum: ['totalTrades', 'profitableTrades', 'currentStreak', 'level', 'xp', 'stopLossUsed', 'lessonsCompleted', 'challengesCompleted'], required: true },
    value: { type: Number, required: true },
  },
  xpReward: { type: Number, default: 50 },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common',
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Badge = model('Badge', BadgeSchema);

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

export async function seedBadges() {
  const count = await Badge.countDocuments();
  if (count > 0) return;
  await Badge.insertMany(defaultBadges);
  console.log('[Seed] Badges inserted');
}

export default Badge;
