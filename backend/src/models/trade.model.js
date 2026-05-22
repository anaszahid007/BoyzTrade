import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

/**
 * Trade model - records executed or pending trades
 */
const TradeSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    assetId: { type: Types.ObjectId, ref: 'Asset', required: true, index: true },
    tradeType: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['COMPLETED', 'FAILED', 'PENDING'], default: 'PENDING' },
    executedAt: { type: Date }
  },
  { timestamps: true }
);

export default model('Trade', TradeSchema);
