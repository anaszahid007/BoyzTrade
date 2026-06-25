import * as adminService from '../services/admin/index.js';
import * as gamificationService from '../services/gamification/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import Response from '../utils/Response.js';

/**
 * GET /api/admin/stats
 */
export const getStats = asyncHandler(async (req, res, next) => {
  const stats = await adminService.getGlobalStats();
  return Response.success(res, stats, 'Global stats retrieved successfully', 200);
});

/**
 * GET /api/admin/users
 */
export const getUsers = asyncHandler(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const isVerified = req.query.isVerified || '';

  const usersData = await adminService.getUsersList({ page, limit, search, role, isVerified });
  return Response.success(res, usersData.data, 'Users list retrieved successfully', 200, usersData.pagination);

});

/**
 * GET /api/admin/users/:userId
 */
export const getUser = asyncHandler(async (req, res, next) => {

  const { userId } = req.params;
  const userDetails = await adminService.getUserDetails(userId);
  return Response.success(res, userDetails, 'User details retrieved successfully', 200);

});

/**
 * PATCH /api/admin/users/:userId/role
 */
export const updateUserRole = asyncHandler(async (req, res, next) => {

  const { userId } = req.params;
  const { role } = req.body;

  if (!role) {
    throw new ErrorResponse(400, 'Role is required');
  }

  const updatedUser = await adminService.updateUserRole(userId, role);
  return Response.success(res, updatedUser, `User role updated to ${role} successfully`, 200);

});

/**
 * PATCH /api/admin/users/:userId/verify
 */
export const toggleUserVerification = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const updatedUser = await adminService.toggleUserVerification(userId);
  return Response.success(res, updatedUser, 'User verification status updated successfully', 200);

})

/**
 * PATCH /api/admin/users/:userId/balance
 */
export const adjustUserBalance = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { amount, description } = req.body;

  if (amount === undefined || typeof amount !== 'number') {
    throw new ErrorResponse(400, 'Adjustment amount must be a number');
  }

  const result = await adminService.adjustUserBalance(userId, { amount, description });
  return Response.success(res, result, 'User balance adjusted successfully', 200);

});

/**
 * DELETE /api/admin/users/:userId
 */
export const deleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Prevent self-deletion
  if (req.user._id.toString() === userId) {
    throw new ErrorResponse(400, 'You cannot delete your own admin account');
  }

  const result = await adminService.deleteUserCascade(userId);
  return Response.success(res, result, 'User and associated data deleted successfully', 200);

});

/**
 * GET /api/admin/trades
 */
export const getTrades = asyncHandler(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const symbol = req.query.symbol || '';
  const type = req.query.type || '';
  const status = req.query.status || '';
  const userId = req.query.userId || '';

  const tradesData = await adminService.getGlobalTrades({ page, limit, symbol, type, status, userId });

  const data = {
    trades: tradesData.data,
    pagination: tradesData.pagination
  }
  return Response.success(res, data, 'Global trades retrieved successfully', 200);

});

/**
 * GET /api/admin/assets
 */
export const getAssets = asyncHandler(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';

  const assetsData = await adminService.getGlobalAssets({ page, limit, search });
  const data = {
    assets: assetsData.data,
    pagination: assetsData.pagination
  }
  return Response.success(res, data, 'Global assets retrieved successfully', 200);

});

/**
 * POST /api/admin/assets
 */
export const createAsset = asyncHandler(async (req, res, next) => {
  const { symbol, name, marketType, currentPrice, logo } = req.body;
  const asset = await adminService.createAsset({ symbol, name, marketType, currentPrice, logo });
  return Response.success(res, asset, 'Asset created successfully', 201);
})

/**
 * PATCH /api/admin/assets/:assetId
 */
export const updateAsset = asyncHandler(async (req, res, next) => {
  const { assetId } = req.params;
  const updatedAsset = await adminService.updateAsset(assetId, req.body);
  return Response.success(res, updatedAsset, 'Asset updated successfully', 200);
});

/**
 * DELETE /api/admin/assets/:assetId
 */
export const deleteAsset = asyncHandler(async (req, res, next) => {
  const { assetId } = req.params;
  const result = await adminService.deleteAsset(assetId);
  return Response.success(res, result, 'Asset deleted successfully', 200);
})

/**
 * POST /api/admin/broadcast
 */
export const broadcastAlert = asyncHandler(async (req, res, next) => {
  const { title, message, type } = req.body;
  const result = await adminService.broadcastNotification({ title, message, type });
  return Response.success(res, result, 'Broadcast notification sent successfully', 200);

});

/**
 * GET /api/admin/badges
 */
export const getBadges = asyncHandler(async (req, res, next) => {
  const data = await gamificationService.listBadges();
  return Response.success(res, data, 'Badges retrieved successfully', 200);
})

/**
 * POST /api/admin/badges
 */
export const createBadge = asyncHandler(async (req, res, next) => {
  const data = await gamificationService.createBadge(req.body);
  return Response.success(res, data, 'Badge created successfully', 201);
})

/**
 * PATCH /api/admin/badges/:badgeId
 */
export const updateBadge = asyncHandler(async (req, res, next) => {
  const data = await gamificationService.updateBadge(req.params.badgeId, req.body);
  return Response.success(res, data, 'Badge updated successfully', 200);
});

/**
 * DELETE /api/admin/badges/:badgeId
 */
export const deleteBadge = asyncHandler(async (req, res, next) => {
  await gamificationService.deleteBadge(req.params.badgeId);
  return Response.success(res, null, 'Badge deleted successfully', 200);
});

/**
 * GET /api/admin/quests
 */
export const getQuests = asyncHandler(async (req, res, next) => {
  const data = await gamificationService.listQuests();
  return Response.success(res, data, 'Quests retrieved successfully', 200);
});

/**
 * POST /api/admin/quests
 */
export const createQuest = asyncHandler(async (req, res, next) => {
  const data = await gamificationService.createQuest(req.body);
  return Response.success(res, data, 'Quest created successfully', 201);
});

/**
 * PATCH /api/admin/quests/:questId
 */
export const updateQuest = asyncHandler(async (req, res, next) => {
  const data = await gamificationService.updateQuest(req.params.questId, req.body);
  return Response.success(res, data, 'Quest updated successfully', 200);
});

/**
 * DELETE /api/admin/quests/:questId
 */
export const deleteQuest = asyncHandler(async (req, res, next) => {
  await gamificationService.deleteQuest(req.params.questId);
  return Response.success(res, null, 'Quest deleted successfully', 200);
})
