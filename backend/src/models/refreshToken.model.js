import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

/**
 * @description RefreshToken stores a hashed token to prevent raw token leakage
 */
const RefreshTokenSchema = new Schema(
    {
        userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
        tokenHash: { type: String, required: true, index: true },
        expiresAt: { type: Date, required: true },
        userAgent: { type: String },
        ipAddress: { type: String }
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// TTL will automatically remove expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('RefreshToken', RefreshTokenSchema);
