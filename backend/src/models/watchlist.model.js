import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

/**
 * Watchlist entries for users
 */
const WatchlistSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    assetId: { type: Types.ObjectId, ref: 'Asset', required: true, index: true }
  },
  { timestamps: true }
);

WatchlistSchema.index({ userId: 1, assetId: 1 }, { unique: true });

export default model('Watchlist', WatchlistSchema);
