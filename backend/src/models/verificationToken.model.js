import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const VerificationTokenSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('VerificationToken', VerificationTokenSchema);
