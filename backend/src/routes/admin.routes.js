import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import * as controller from '../controllers/admin.controller.js';

const router = Router();

// Enforce authentication and admin role requirement for all sub-routes
router.use(protect, requireRole('admin'));

/**
 * Platform metrics
 */
router.get('/stats', controller.getStats);

/**
 * User management
 */
router.get('/users', controller.getUsers);
router.get('/users/:userId', controller.getUser);
router.patch('/users/:userId/role', controller.updateUserRole);
router.patch('/users/:userId/verify', controller.toggleUserVerification);
router.patch('/users/:userId/balance', controller.adjustUserBalance);
router.delete('/users/:userId', controller.deleteUser);

/**
 * Trade logging
 */
router.get('/trades', controller.getTrades);

/**
 * Asset management
 */
router.get('/assets', controller.getAssets);
router.post('/assets', controller.createAsset);
router.patch('/assets/:assetId', controller.updateAsset);
router.delete('/assets/:assetId', controller.deleteAsset);

/**
 * Badge management
 */
router.get('/badges', controller.getBadges);
router.post('/badges', controller.createBadge);
router.patch('/badges/:badgeId', controller.updateBadge);
router.delete('/badges/:badgeId', controller.deleteBadge);

/**
 * Quest management
 */
router.get('/quests', controller.getQuests);
router.post('/quests', controller.createQuest);
router.patch('/quests/:questId', controller.updateQuest);
router.delete('/quests/:questId', controller.deleteQuest);

/**
 * Global communications
 */
router.post('/broadcast', controller.broadcastAlert);

export default router;
