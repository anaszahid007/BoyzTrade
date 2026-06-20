import mongoose from 'mongoose';
import User from '../../models/user.model.js';
import Portfolio from '../../models/portfolio.model.js';
import WalletTransaction from '../../models/walletTransaction.model.js';
import ErrorResponse from '../../utils/ErrorResponse.js';
import { emitToUser } from '../../socket.js';
import { getPortfolio } from '../trade.service.js';

/**
 * Adjust a user's cash balance within a transaction. Creates a wallet
 * transaction record and emits a portfolio-update event via socket.
 * @param {string} userId - The user's ObjectId.
 * @param {Object} adjustment
 * @param {number} adjustment.amount - Amount to add (positive) or subtract (negative).
 * @param {string} [adjustment.description='Admin Adjustment'] - Optional description.
 * @returns {Promise<{userId: string, newBalance: number, transaction: Object}>}
 * @throws {ErrorResponse} 400 if balance would go negative, 404 if user not found.
 */
export const adjustUserBalance = async (userId, { amount, description = 'Admin Adjustment' }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new ErrorResponse(404, 'User not found');

    let portfolio = await Portfolio.findOne({ userId }).session(session);
    if (!portfolio) {
      portfolio = new Portfolio({ userId, totalBalance: 2500, totalAssets: 0, totalProfitLoss: 0 });
    }

    const balanceBefore = portfolio.totalBalance;
    portfolio.totalBalance += amount;

    if (portfolio.totalBalance < 0) {
      throw new ErrorResponse(400, 'Transaction would result in a negative balance');
    }

    await portfolio.save({ session });

    const walletTx = new WalletTransaction({
      userId,
      transactionType: amount >= 0 ? 'DEPOSIT' : 'SELL',
      amount: Math.abs(amount),
      balanceBefore,
      balanceAfter: portfolio.totalBalance,
      description: `${description} (${amount >= 0 ? '+' : '-'}$${Math.abs(amount)})`
    });

    await walletTx.save({ session });
    await session.commitTransaction();
    session.endSession();

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
