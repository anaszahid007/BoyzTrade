import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const UserBadgeSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  badgeId: { type: Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default model('UserBadge', UserBadgeSchema);
