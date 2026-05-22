import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Asset model stores tradable instruments (crypto, stocks, etc.)
 */
const AssetSchema = new Schema(
  {
    assetId: { type: String, required: true, index: true, unique: true }, // e.g., CoinGecko ID for crypto, ticker for stocks
    symbol: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    marketType: { type: String, enum: ['crypto', 'stock', 'other'], default: 'other' },
    currentPrice: { type: Number, default: 0 },
    logo: { type: String },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export default model('Asset', AssetSchema);
