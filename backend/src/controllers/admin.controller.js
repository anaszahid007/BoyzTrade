import * as adminService from '../services/admin.service.js';
import ErrorResponse from '../utils/ErrorResponse.js';

/**
 * GET /api/admin/stats
 */
export async function getStats(req, res, next) {
  try {
    const stats = await adminService.getGlobalStats();
    return res.status(200).json({
      success: true,
      message: 'Global stats retrieved successfully',
      data: stats
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users
 */
export async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const isVerified = req.query.isVerified || '';

    const usersData = await adminService.getUsersList({ page, limit, search, role, isVerified });
    return res.status(200).json({
      success: true,
      message: 'Users list retrieved successfully',
      data: usersData.data,
      pagination: usersData.pagination
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users/:userId
 */
export async function getUser(req, res, next) {
  try {
    const { userId } = req.params;
    const userDetails = await adminService.getUserDetails(userId);
    return res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: userDetails
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/users/:userId/role
 */
export async function updateUserRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      throw new ErrorResponse(400, 'Role is required');
    }

    const updatedUser = await adminService.updateUserRole(userId, role);
    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/users/:userId/verify
 */
export async function toggleUserVerification(req, res, next) {
  try {
    const { userId } = req.params;
    const updatedUser = await adminService.toggleUserVerification(userId);
    return res.status(200).json({
      success: true,
      message: 'User verification status updated successfully',
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/users/:userId/balance
 */
export async function adjustUserBalance(req, res, next) {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;

    if (amount === undefined || typeof amount !== 'number') {
      throw new ErrorResponse(400, 'Adjustment amount must be a number');
    }

    const result = await adminService.adjustUserBalance(userId, { amount, description });
    return res.status(200).json({
      success: true,
      message: 'User balance adjusted successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/users/:userId
 */
export async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    
    // Prevent self-deletion
    if (req.user._id.toString() === userId) {
      throw new ErrorResponse(400, 'You cannot delete your own admin account');
    }

    const result = await adminService.deleteUserCascade(userId);
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/trades
 */
export async function getTrades(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const symbol = req.query.symbol || '';
    const type = req.query.type || '';
    const status = req.query.status || '';
    const userId = req.query.userId || '';

    const tradesData = await adminService.getGlobalTrades({ page, limit, symbol, type, status, userId });
    return res.status(200).json({
      success: true,
      message: 'Global trades retrieved successfully',
      data: tradesData.data,
      pagination: tradesData.pagination
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/assets
 */
export async function getAssets(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const assetsData = await adminService.getGlobalAssets({ page, limit, search });
    return res.status(200).json({
      success: true,
      message: 'Global assets retrieved successfully',
      data: assetsData.data,
      pagination: assetsData.pagination
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/assets
 */
export async function createAsset(req, res, next) {
  try {
    const { symbol, name, marketType, currentPrice, logo } = req.body;
    const asset = await adminService.createAsset({ symbol, name, marketType, currentPrice, logo });
    return res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: asset
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/assets/:assetId
 */
export async function updateAsset(req, res, next) {
  try {
    const { assetId } = req.params;
    const updatedAsset = await adminService.updateAsset(assetId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/assets/:assetId
 */
export async function deleteAsset(req, res, next) {
  try {
    const { assetId } = req.params;
    const result = await adminService.deleteAsset(assetId);
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/broadcast
 */
export async function broadcastAlert(req, res, next) {
  try {
    const { title, message, type } = req.body;
    const result = await adminService.broadcastNotification({ title, message, type });
    return res.status(200).json({
      success: true,
      message: `System notification broadcasted to ${result.count} users successfully`,
      data: result
    });
  } catch (err) {
    next(err);
  }
}
