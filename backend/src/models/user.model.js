import mongoose from 'mongoose';
import argon2 from 'argon2';

const { Schema, model } = mongoose;

/**
 * @schema User
 * @description password is accepted on create/update but not persisted; passwordHash is stored
 */
const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    fullName: { type: String, required: true, index: true },
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    role: { type: String, default: 'user' , enum: ['user', 'instructor', 'admin']},
    notificationPreferences: {
      trade: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      alert: { type: Boolean, default: true },
      market: { type: Boolean, default: false }
    },
    surveyCompleted: { type: Boolean, default: false },
    onboardingSurvey: {
      experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'professional'], default: null },
      referralSource: { type: String, default: null },
      tradingGoals: { type: String, default: null }
    }
  },
  { timestamps: true }
);

/**
 * pre-save middleware: hash password if provided and store in passwordHash
 */
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const hash = await argon2.hash(this.password);
  this.password = hash;
});

/**
 * @description Compare a plain password to stored passwordHash
 * @param {string} candidate
 * @returns {Promise<boolean>}
 */
UserSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return argon2.verify(this.password, candidate);
};

export default model('User', UserSchema);