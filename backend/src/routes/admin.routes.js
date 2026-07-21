import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { adminLimiter } from '../middleware/rateLimiter.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  updateUserRoleSchema,
  adjustUserBalanceSchema,
  createAssetSchema,
  updateAssetSchema,
  createBadgeSchema,
  updateBadgeSchema,
  createQuestSchema,
  updateQuestSchema,
  broadcastAlertSchema,
} from '../validators/admin.validator.js';
import * as controller from '../controllers/admin.controller.js';

const router = Router();

// Enforce authentication, rate limiting, and admin role requirement for all sub-routes
router.use(protect, requireRole('admin'), adminLimiter);

/**
 * Platform metrics
 */
router.get('/stats', controller.getStats);

/**
 * User management
 */
router.get('/users', controller.getUsers);
router.get('/users/:userId', controller.getUser);
router.patch('/users/:userId/role', validate(updateUserRoleSchema), controller.updateUserRole);
router.patch('/users/:userId/verify', controller.toggleUserVerification);
router.patch('/users/:userId/balance', validate(adjustUserBalanceSchema), controller.adjustUserBalance);
router.delete('/users/:userId', controller.deleteUser);

/**
 * Trade logging
 */
router.get('/trades', controller.getTrades);

/**
 * Asset management
 */
router.get('/assets', controller.getAssets);
router.post('/assets', validate(createAssetSchema), controller.createAsset);
router.patch('/assets/:assetId', validate(updateAssetSchema), controller.updateAsset);
router.delete('/assets/:assetId', controller.deleteAsset);

/**
 * Badge management
 */
router.get('/badges', controller.getBadges);
router.post('/badges', validate(createBadgeSchema), controller.createBadge);
router.patch('/badges/:badgeId', validate(updateBadgeSchema), controller.updateBadge);
router.delete('/badges/:badgeId', controller.deleteBadge);

/**
 * Quest management
 */
router.get('/quests', controller.getQuests);
router.post('/quests', validate(createQuestSchema), controller.createQuest);
router.patch('/quests/:questId', validate(updateQuestSchema), controller.updateQuest);
router.delete('/quests/:questId', controller.deleteQuest);

/**
 * Global communications
 */
router.post('/broadcast', validate(broadcastAlertSchema), controller.broadcastAlert);

export default router;
