import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

/**
 * PortfolioHolding - assets held within a portfolio
 */
const PortfolioHoldingSchema = new Schema(
  {
    portfolioId: { type: Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    assetId: { type: Types.ObjectId, ref: 'Asset', required: true, index: true },
    quantity: { type: Number, default: 0 },
    averageBuyPrice: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    profitLoss: { type: Number, default: 0 }
  },
  { timestamps: true }
);

PortfolioHoldingSchema.index({ portfolioId: 1, assetId: 1 }, { unique: true });

export default model('PortfolioHolding', PortfolioHoldingSchema);
