import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  surveySchema,
} from '../src/validators/auth.validator.js';
import {
  updateUserRoleSchema,
  adjustUserBalanceSchema,
  createAssetSchema,
  broadcastAlertSchema,
} from '../src/validators/admin.validator.js';
import { addWatchlistSchema } from '../src/validators/watchlist.validator.js';
import { validateTrade } from '../src/validators/trade.validator.js';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        fullName: 'Test User',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        fullName: 'Test User',
        password: '1234567',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateProfileSchema', () => {
    it('should accept optional fullName', () => {
      const result = updateProfileSchema.safeParse({ fullName: 'New Name' });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('changePasswordSchema', () => {
    it('should accept valid password change data', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing currentPassword', () => {
      const result = changePasswordSchema.safeParse({ newPassword: 'newpass123' });
      expect(result.success).toBe(false);
    });
  });

  describe('surveySchema', () => {
    it('should accept valid survey data', () => {
      const result = surveySchema.safeParse({
        experienceLevel: 'beginner',
        referralSource: 'google',
        tradingGoals: 'learn',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty survey data', () => {
      const result = surveySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

describe('Admin Validators', () => {
  describe('updateUserRoleSchema', () => {
    it('should accept valid role', () => {
      const result = updateUserRoleSchema.safeParse({ role: 'admin' });
      expect(result.success).toBe(true);
    });

    it('should reject empty role', () => {
      const result = updateUserRoleSchema.safeParse({ role: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('adjustUserBalanceSchema', () => {
    it('should accept valid balance adjustment', () => {
      const result = adjustUserBalanceSchema.safeParse({ amount: 1000 });
      expect(result.success).toBe(true);
    });

    it('should reject missing amount', () => {
      const result = adjustUserBalanceSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject non-numeric amount', () => {
      const result = adjustUserBalanceSchema.safeParse({ amount: 'abc' });
      expect(result.success).toBe(false);
    });
  });

  describe('createAssetSchema', () => {
    it('should accept valid asset data', () => {
      const result = createAssetSchema.safeParse({
        symbol: 'BTC',
        name: 'Bitcoin',
        marketType: 'crypto',
        currentPrice: 50000,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid marketType', () => {
      const result = createAssetSchema.safeParse({
        symbol: 'BTC',
        name: 'Bitcoin',
        marketType: 'invalid',
        currentPrice: 50000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('broadcastAlertSchema', () => {
    it('should accept valid broadcast data', () => {
      const result = broadcastAlertSchema.safeParse({
        title: 'Alert',
        message: 'System maintenance',
        type: 'info',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = broadcastAlertSchema.safeParse({
        title: '',
        message: 'System maintenance',
        type: 'info',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Watchlist Validator', () => {
  describe('addWatchlistSchema', () => {
    it('should accept valid symbol', () => {
      const result = addWatchlistSchema.safeParse({ symbol: 'BTC' });
      expect(result.success).toBe(true);
    });

    it('should reject empty symbol', () => {
      const result = addWatchlistSchema.safeParse({ symbol: '' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Trade Validator', () => {
  describe('validateTrade', () => {
    it('should accept valid trade data', () => {
      const result = validateTrade.safeParse({ symbol: 'BTC', quantity: 0.5 });
      expect(result.success).toBe(true);
    });

    it('should reject zero quantity', () => {
      const result = validateTrade.safeParse({ symbol: 'BTC', quantity: 0 });
      expect(result.success).toBe(false);
    });
  });
});
