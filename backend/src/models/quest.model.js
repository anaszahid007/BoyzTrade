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

export default Quest;
