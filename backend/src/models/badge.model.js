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


export default Badge;
