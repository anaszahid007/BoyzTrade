import User from '../../models/user.model.js';
import Portfolio from '../../models/portfolio.model.js';
import Trade from '../../models/trade.model.js';
import WalletTransaction from '../../models/walletTransaction.model.js';
import UserGamification from '../../models/userGamification.model.js';
import LevelConfig from '../../models/levelConfig.model.js';
import ErrorResponse from '../../utils/ErrorResponse.js';
import { getPortfolio } from '../trade.service.js';

/**
 * Fetch a paginated list of users with optional search, role, and verification
 * filters. Enriches each user with portfolio and gamification data.
 * @param {Object} options
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.limit=20] - Results per page.
 * @param {string} [options.search=''] - Search term for email or full name.
 * @param {string} [options.role=''] - Role filter (e.g. 'user', 'admin').
 * @param {string} [options.isVerified=''] - Verification status filter.
 * @returns {Promise<{data: Object[], pagination: Object}>} Paginated users.
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

  const userIds = users.map(u => u._id);
  const portfolios = await Portfolio.find({ userId: { $in: userIds } }).lean();
  const portfolioMap = new Map(portfolios.map(p => [p.userId.toString(), p]));

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
        totalBalance: 10000,
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
 * Get detailed information for a single user, including portfolio, recent
 * trades, recent transactions, and gamification progress with level context.
 * @param {string} userId - The user's ObjectId.
 * @returns {Promise<Object>} User details with related data.
 * @throws {ErrorResponse} 404 if user not found.
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
 * Update a user's role. Only 'user' or 'admin' are accepted.
 * @param {string} userId - The user's ObjectId.
 * @param {string} role - The new role ('user' | 'admin').
 * @returns {Promise<Object>} Updated user document (without password).
 * @throws {ErrorResponse} 400 if role is invalid, 404 if user not found.
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
 * Toggle a user's email verification status.
 * @param {string} userId - The user's ObjectId.
 * @returns {Promise<{_id: string, email: string, isVerified: boolean}>}
 * @throws {ErrorResponse} 404 if user not found.
 */
export const toggleUserVerification = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse(404, 'User not found');

  user.isVerified = !user.isVerified;
  await user.save();

  return { _id: user._id, email: user.email, isVerified: user.isVerified };
};
