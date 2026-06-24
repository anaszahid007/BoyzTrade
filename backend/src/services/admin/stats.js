import User from '../../models/user.model.js';
import Trade from '../../models/trade.model.js';
import Asset from '../../models/asset.model.js';
import WalletTransaction from '../../models/walletTransaction.model.js';
import Portfolio from '../../models/portfolio.model.js';
import UserGamification from '../../models/userGamification.model.js';
import Badge from '../../models/badge.model.js';
import Quest from '../../models/quest.model.js';
import UserBadge from '../../models/userBadge.model.js';
import UserQuest from '../../models/userQuest.model.js';

/**
 * Retrieve global platform statistics including user, trade, asset, and
 * transaction counts, total portfolio value, trade status breakdown, and
 * gamification aggregates (XP, levels, badges, quests).
 * @returns {Promise<Object>} Aggregated platform stats.
 */
export const getGlobalStats = async () => {
  const [totalUsers, totalTrades, totalAssets, totalTransactions] = await Promise.all([
    User.countDocuments(),
    Trade.countDocuments(),
    Asset.countDocuments(),
    WalletTransaction.countDocuments()
  ]);

  // no need to show to the client the total cash balance of all users, so we can just sum the totalBalance field from the Portfolio collection
  const balanceAgg = await Portfolio.aggregate([
    { $group: { _id: null, totalCashBalance: { $sum: '$totalBalance' } } }
  ]);
  const totalCashBalance = balanceAgg[0]?.totalCashBalance || 0;

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

  const [totalBadges, totalQuests] = await Promise.all([
    UserGamification.aggregate([
      { $group: { _id: null, totalXp: { $sum: '$xp' }, avgLevel: { $avg: '$level' } } }
    ]),
    
    Badge.countDocuments({ isActive: true }),
    UserBadge.countDocuments(),
    UserQuest.countDocuments({ completed: true }),
  ]);

  return {
    totalUsers,
    totalPortfolioValue: totalCashBalance,
    totalTrades: tradesByStatus,
    totalAssets,
    gamification: {
      totalBadges,
      totalQuests,
    }
  };
};
