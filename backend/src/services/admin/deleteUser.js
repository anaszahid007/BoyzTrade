import mongoose from 'mongoose';
import User from '../../models/user.model.js';
import Portfolio from '../../models/portfolio.model.js';
import PortfolioHolding from '../../models/portfolioHolding.model.js';
import Trade from '../../models/trade.model.js';
import WalletTransaction from '../../models/walletTransaction.model.js';
import Watchlist from '../../models/watchlist.model.js';
import Notification from '../../models/notification.model.js';
import ErrorResponse from '../../utils/ErrorResponse.js';

/**
 * Permanently delete a user and all associated data (portfolio, holdings,
 * trades, transactions, watchlist, notifications) within a transaction.
 * @param {string} userId - The user's ObjectId.
 * @returns {Promise<{success: boolean, message: string}>}
 * @throws {ErrorResponse} 404 if user not found.
 */
export const deleteUserCascade = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new ErrorResponse(404, 'User not found');

    const portfolio = await Portfolio.findOne({ userId }).session(session);
    const portfolioId = portfolio?._id;

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
