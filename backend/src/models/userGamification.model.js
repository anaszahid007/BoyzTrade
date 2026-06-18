import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const UserGamificationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    levelTitle: { type: String, default: 'Beginner' },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    totalTrades: { type: Number, default: 0 },
    profitableTrades: { type: Number, default: 0 },
    stopLossUsed: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    challengesCompleted: { type: Number, default: 0 },
    careerStage: { type: Number, default: 0 },
    careerTitle: { type: String, default: '' },
    virtualSalary: { type: Number, default: 0 },
    unlockedFeatures: { type: [String], default: [] },
  },
  { timestamps: true }
);

UserGamificationSchema.statics.findOrCreate = async function (userId) {
  let profile = await this.findOne({ userId });
  if (!profile) {
    profile = await this.create({ userId });
  }
  return profile;
};

export default model('UserGamification', UserGamificationSchema);
