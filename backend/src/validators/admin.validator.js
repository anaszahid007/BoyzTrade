import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  role: z.string().min(1, 'Role is required'),
});

export const adjustUserBalanceSchema = z.object({
  amount: z.number({ required_error: 'Amount is required' }),
  description: z.string().optional(),
});

export const createAssetSchema = z.object({
  symbol: z.string().min(1).max(10),
  name: z.string().min(1),
  marketType: z.enum(['crypto', 'stock', 'other']),
  currentPrice: z.number().nonnegative(),
  logo: z.string().optional(),
});

export const updateAssetSchema = z.object({
  symbol: z.string().min(1).max(10).optional(),
  name: z.string().min(1).optional(),
  marketType: z.enum(['crypto', 'stock', 'other']).optional(),
  currentPrice: z.number().nonnegative().optional(),
  logo: z.string().optional(),
});

const requirementSchema = z.object({
  type: z.enum([
    'totalTrades', 'profitableTrades', 'currentStreak', 'level',
    'xp', 'stopLossUsed', 'lessonsCompleted', 'challengesCompleted',
    'dailyTrades', 'totalPnl', 'consecutiveLoginDays',
  ]),
  value: z.number().nonnegative(),
});

export const createBadgeSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  category: z.enum(['trade', 'streak', 'level', 'profit', 'social', 'milestone']).optional(),
  requirement: requirementSchema,
  xpReward: z.number().nonnegative().optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
});

export const updateBadgeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
  category: z.enum(['trade', 'streak', 'level', 'profit', 'social', 'milestone']).optional(),
  requirement: requirementSchema.optional(),
  xpReward: z.number().nonnegative().optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
});

export const createQuestSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  type: z.enum(['daily', 'weekly', 'milestone']).optional(),
  requirement: requirementSchema,
  xpReward: z.number().nonnegative(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isRepeatable: z.boolean().optional(),
});

export const updateQuestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
  type: z.enum(['daily', 'weekly', 'milestone']).optional(),
  requirement: requirementSchema.optional(),
  xpReward: z.number().nonnegative().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isRepeatable: z.boolean().optional(),
});

export const broadcastAlertSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.string().min(1),
});

export default {
  updateUserRoleSchema,
  adjustUserBalanceSchema,
  createAssetSchema,
  updateAssetSchema,
  createBadgeSchema,
  updateBadgeSchema,
  createQuestSchema,
  updateQuestSchema,
  broadcastAlertSchema,
};
