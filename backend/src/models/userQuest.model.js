import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const UserQuestSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  questId: { type: Types.ObjectId, ref: 'Quest', required: true },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  claimed: { type: Boolean, default: false },
  claimedAt: { type: Date },
  periodStart: { type: Date },
  periodEnd: { type: Date },
}, { timestamps: true });

UserQuestSchema.index({ userId: 1, questId: 1, periodStart: 1 }, { unique: true });

export default model('UserQuest', UserQuestSchema);
