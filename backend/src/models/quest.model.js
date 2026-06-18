import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const QuestSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'milestone'],
    default: 'milestone',
  },
  requirement: {
    type: { type: String, enum: ['totalTrades', 'profitableTrades', 'currentStreak', 'xp', 'dailyTrades', 'totalPnl', 'consecutiveLoginDays'], required: true },
    value: { type: Number, required: true },
  },
  xpReward: { type: Number, required: true },
  startsAt: { type: Date },
  endsAt: { type: Date },
  isActive: { type: Boolean, default: true },
  isRepeatable: { type: Boolean, default: false },
}, { timestamps: true });

const Quest = model('Quest', QuestSchema);

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

export async function seedQuests() {
  for (const q of defaultQuests) {
    await Quest.findOneAndUpdate({ name: q.name }, q, { upsert: true, new: true });
  }
  console.log('[Seed] Quests synced');
}

export default Quest;
