import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

/**
 * WalletTransaction model - ledger of virtual currency movements
 */
const WalletTransactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    transactionType: { type: String, enum: ['DEPOSIT', 'BUY', 'SELL', 'REFUND'], required: true },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceId: { type: String },
    description: { type: String }
  },
  { timestamps: true }
);

export default model('WalletTransaction', WalletTransactionSchema);
