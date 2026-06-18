import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Portfolio from '../models/portfolio.model.js';
import PortfolioHolding from '../models/portfolioHolding.model.js';
import Trade from '../models/trade.model.js';
import WalletTransaction from '../models/walletTransaction.model.js';
import Watchlist from '../models/watchlist.model.js';
import Notification from '../models/notification.model.js';
import Asset from '../models/asset.model.js';
import UserGamification from '../models/userGamification.model.js';
import LevelConfig from '../models/levelConfig.model.js';
import Badge from '../models/badge.model.js';
import Quest from '../models/quest.model.js';
import UserBadge from '../models/userBadge.model.js';
import UserQuest from '../models/userQuest.model.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import { broadcast, emitToUser } from '../socket.js';
import { getPortfolio } from './trade.service.js';

/**
 * Get global platform stats
 */
export const getGlobalStats = async () => {
  const [totalUsers, totalTrades, totalAssets, totalTransactions] = await Promise.all([
    User.countDocuments(),
    Trade.countDocuments(),
    Asset.countDocuments(),
    WalletTransaction.countDocuments()
  ]);

  // Sum all cash balances in portfolios
  const balanceAgg = await Portfolio.aggregate([
    { $group: { _id: null, totalCashBalance: { $sum: '$totalBalance' } } }
  ]);
  const totalCashBalance = balanceAgg[0]?.totalCashBalance || 0;

  // Count trades by status
  const tradeStatusAgg = await Trade.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const tradesByStatus = {
    total: totalTrades,
    completed: 0,
    pending: 0,
    failed: 0
  };
  
  tradeStatusAgg.forEach(item => {
    if (item._id === 'COMPLETED') tradesByStatus.completed = item.count;
    if (item._id === 'PENDING') tradesByStatus.pending = item.count;
    if (item._id === 'FAILED') tradesByStatus.failed = item.count;
  });

  // Gamification aggregates
  const [xpAgg, surveyCount, totalBadges, totalQuests, earnedBadgesCount, questCompletions] = await Promise.all([
    UserGamification.aggregate([
      { $group: { _id: null, totalXp: { $sum: '$xp' }, avgLevel: { $avg: '$level' } } }
    ]),
    User.countDocuments({ surveyCompleted: true }),
    Badge.countDocuments({ isActive: true }),
    Quest.countDocuments({ isActive: true }),
    UserBadge.countDocuments(),
    UserQuest.countDocuments({ completed: true }),
  ]);

  return {
    totalUsers,
    totalPortfolioValue: totalCashBalance,
    totalTrades: tradesByStatus,
    totalAssets,
    totalTransactions,
    gamification: {
      totalXp: xpAgg[0]?.totalXp || 0,
      averageLevel: xpAgg[0] ? Math.round(xpAgg[0].avgLevel * 10) / 10 : 0,
      surveyCompleted: surveyCount,
      totalBadges,
      totalQuests,
      earnedBadgesCount,
      questCompletions,
    }
  };
};

/**
 * Get users list with paginated search/filters
 */
export const getUsersList = async ({ page = 1, limit = 20, search = '', role = '', isVerified = '' }) => {
  const query = {};
  
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    query.role = role;
  }
  
  if (isVerified !== '') {
    query.isVerified = isVerified === 'true';
  }

  const skip = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query)
  ]);

  // Fetch portfolios for each user to get cash balance and statistics
  const userIds = users.map(u => u._id);
  const portfolios = await Portfolio.find({ userId: { $in: userIds } }).lean();
  const portfolioMap = new Map(portfolios.map(p => [p.userId.toString(), p]));

  // Fetch gamification profiles
  const gamificationProfiles = await UserGamification.find({ userId: { $in: userIds } }).lean();
  const gamificationMap = new Map(gamificationProfiles.map(g => [g.userId.toString(), g]));

  const usersWithDetails = users.map(user => {
    const portfolio = portfolioMap.get(user._id.toString());
    const gamification = gamificationMap.get(user._id.toString());
    return {
      ...user,
      portfolio: portfolio ? {
        totalBalance: portfolio.totalBalance,
        totalProfitLoss: portfolio.totalProfitLoss,
        totalAssets: portfolio.totalAssets
      } : {
        totalBalance: 10000, // Default initial balance if not created yet
        totalProfitLoss: 0,
        totalAssets: 0
      },
      gamification: gamification ? {
        xp: gamification.xp,
        level: gamification.level,
        levelTitle: gamification.levelTitle,
        currentStreak: gamification.currentStreak,
      } : {
        xp: 0,
        level: 1,
        levelTitle: 'Beginner',
        currentStreak: 0,
      }
    };
  });

  return {
    data: usersWithDetails,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get specific user details with holdings and history
 */
export const getUserDetails = async (userId) => {
  const user = await User.findById(userId).select('-password').lean();
  if (!user) throw new ErrorResponse(404, 'User not found');

  const portfolioResult = await getPortfolio(userId);
  const trades = await Trade.find({ userId }).sort({ createdAt: -1 }).limit(10).populate('assetId').lean();
  const transactions = await WalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();

  const gamification = await UserGamification.findOne({ userId }).lean();

  let gamificationData = null;
  if (gamification) {
    const nextLevel = await LevelConfig.findOne({ level: gamification.level + 1 }).lean();
    const currentLevel = await LevelConfig.findOne({ level: gamification.level }).lean();

    gamificationData = {
      xp: gamification.xp,
      level: gamification.level,
      levelTitle: gamification.levelTitle,
      xpForNext: nextLevel ? nextLevel.xpRequired : gamification.xp,
      xpForCurrent: currentLevel ? currentLevel.xpRequired : 0,
      currentStreak: gamification.currentStreak,
      longestStreak: gamification.longestStreak,
      totalTrades: gamification.totalTrades,
      profitableTrades: gamification.profitableTrades,
      challengesCompleted: gamification.challengesCompleted,
      lessonsCompleted: gamification.lessonsCompleted,
    };
  }

  return {
    user,
    portfolio: portfolioResult.data,
    recentTrades: trades,
    recentTransactions: transactions,
    gamification: gamificationData,
  };
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, role) => {
  if (!['user', 'admin'].includes(role)) {
    throw new ErrorResponse(400, 'Invalid role');
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
  if (!user) throw new ErrorResponse(404, 'User not found');
  
  return user;
};

/**
 * Toggle user email verification
 */
export const toggleUserVerification = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse(404, 'User not found');

  user.isVerified = !user.isVerified;
  await user.save();

  return { _id: user._id, email: user.email, isVerified: user.isVerified };
};

/**
 * Adjust user virtual cash balance
 */
export const adjustUserBalance = async (userId, { amount, description = 'Admin Adjustment' }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new ErrorResponse(404, 'User not found');

    let portfolio = await Portfolio.findOne({ userId }).session(session);
    if (!portfolio) {
      portfolio = new Portfolio({ userId, totalBalance: 10000, totalAssets: 0, totalProfitLoss: 0 });
    }

    const balanceBefore = portfolio.totalBalance;
    portfolio.totalBalance += amount;
    
    if (portfolio.totalBalance < 0) {
      throw new ErrorResponse(400, 'Transaction would result in a negative balance');
    }

    await portfolio.save({ session });

    const walletTx = new WalletTransaction({
      userId,
      transactionType: amount >= 0 ? 'DEPOSIT' : 'SELL', // Use existing types
      amount: Math.abs(amount),
      balanceBefore,
      balanceAfter: portfolio.totalBalance,
      description: `${description} (${amount >= 0 ? '+' : '-'}$${Math.abs(amount)})`
    });
    
    await walletTx.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Emit live portfolio update to user
    getPortfolio(userId).then(portfolioData => {
      emitToUser(userId, "portfolio-update", portfolioData.data);
    });

    return {
      userId,
      newBalance: portfolio.totalBalance,
      transaction: walletTx
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Cascade delete a user and all of their related data
 */
export const deleteUserCascade = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new ErrorResponse(404, 'User not found');

    const portfolio = await Portfolio.findOne({ userId }).session(session);
    const portfolioId = portfolio?._id;

    // Delete related records
    await Promise.all([
      User.deleteOne({ _id: userId }).session(session),
      Portfolio.deleteOne({ userId }).session(session),
      portfolioId ? PortfolioHolding.deleteMany({ portfolioId }).session(session) : Promise.resolve(),
      Trade.deleteMany({ userId }).session(session),
      WalletTransaction.deleteMany({ userId }).session(session),
      Watchlist.deleteMany({ userId }).session(session),
      Notification.deleteMany({ userId }).session(session)
    ]);

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: 'User and all associated data deleted successfully' };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get all trades across the platform (paginated, filterable)
 */
export const getGlobalTrades = async ({ page = 1, limit = 20, symbol = '', type = '', status = '', userId = '' }) => {
  const query = {};

  if (userId) {
    query.userId = userId;
  }
  
  if (type) {
    query.tradeType = type;
  }
  
  if (status) {
    query.status = status;
  }

  if (symbol) {
    const asset = await Asset.findOne({ symbol: symbol.toUpperCase() });
    if (asset) {
      query.assetId = asset._id;
    } else {
      // If asset is not found, return empty set
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
  }

  const skip = (page - 1) * limit;

  const [trades, total] = await Promise.all([
    Trade.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email fullName')
      .populate('assetId', 'symbol name logo')
      .lean(),
    Trade.countDocuments(query)
  ]);

  return {
    data: trades,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get all assets in the system (paginated, filterable)
 */
export const getGlobalAssets = async ({ page = 1, limit = 20, search = '' }) => {
  const query = {};

  if (search) {
    query.$or = [
      { symbol: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [assets, total] = await Promise.all([
    Asset.find(query).sort({ symbol: 1 }).skip(skip).limit(limit).lean(),
    Asset.countDocuments(query)
  ]);

  return {
    data: assets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Create a new asset manually
 */
export const createAsset = async (assetData) => {
  const { symbol, name, marketType = 'crypto', currentPrice = 0, logo } = assetData;

  if (!symbol || !name) {
    throw new ErrorResponse(400, 'Symbol and Name are required');
  }

  const existing = await Asset.findOne({ symbol: symbol.toUpperCase() });
  if (existing) {
    throw new ErrorResponse(400, `Asset with symbol ${symbol} already exists`);
  }

  const newAsset = await Asset.create({
    assetId: symbol.toLowerCase(), // generate a fallback internal assetId matching lowercase symbol
    symbol: symbol.toUpperCase(),
    name,
    marketType,
    currentPrice,
    logo: logo || `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${symbol.toLowerCase()}.png`
  });

  return newAsset;
};

/**
 * Update an existing asset
 */
export const updateAsset = async (assetId, updateData) => {
  const asset = await Asset.findByIdAndUpdate(assetId, updateData, { new: true });
  if (!asset) throw new ErrorResponse(404, 'Asset not found');
  return asset;
};

/**
 * Delete an asset
 */
export const deleteAsset = async (assetId) => {
  const asset = await Asset.findByIdAndDelete(assetId);
  if (!asset) throw new ErrorResponse(404, 'Asset not found');
  return { success: true, message: 'Asset deleted successfully' };
};

/**
 * Broadcast notification message to all users
 */
export const broadcastNotification = async ({ title, message, type = 'SYSTEM' }) => {
  if (!title || !message) {
    throw new ErrorResponse(400, 'Title and Message are required for broadcast');
  }

  const users = await User.find({}, '_id');
  if (users.length === 0) return { success: true, count: 0 };

  const notifications = users.map(user => ({
    userId: user._id,
    title,
    message,
    type,
    isRead: false
  }));

  await Notification.insertMany(notifications);

  // Broadcast socket event for real-time notification overlays
  broadcast('notification', {
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date(),
    meta: { isBroadcast: true }
  });

  return { success: true, count: users.length };
};
