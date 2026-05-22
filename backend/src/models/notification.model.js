import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

/**
 * Notification model for user messages
 */
const NotificationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['TRADE', 'SYSTEM', 'ALERT', 'MARKET'], default: 'SYSTEM' },
    isRead: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });

export default model('Notification', NotificationSchema);
