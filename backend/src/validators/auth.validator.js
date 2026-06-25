import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const forgotPasswordSchema = z.object({ email: z.string().email() });

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8).max(128),
});

export const updateSettingsSchema = z.object({
  notificationPreferences: z.object({
    trade: z.boolean().optional(),
    system: z.boolean().optional(),
    alert: z.boolean().optional(),
    market: z.boolean().optional(),
  }).optional(),
});

export const surveySchema = z.object({
  experienceLevel: z.string().optional(),
  referralSource: z.string().optional(),
  tradingGoals: z.string().optional(),
});

export default { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, changePasswordSchema, updateSettingsSchema, surveySchema };
