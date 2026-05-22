import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

/**
 * Portfolio model - one per user
 * @property {ObjectId} userId
 * @property {Number} totalBalance
 * @property {Number} totalProfitLoss
 * @property {Number} totalAssets
 */
const PortfolioSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    totalBalance: { type: Number, default: 0 },
    totalProfitLoss: { type: Number, default: 0 },
    totalAssets: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default model('Portfolio', PortfolioSchema);
