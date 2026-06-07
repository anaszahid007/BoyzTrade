import mongoose from 'mongoose';

// Utils
import ApiError from '../utils/ApiError.js';

// Models
import Trade from '../models/trade.model.js';
import Asset from '../models/asset.model.js';
import Portfolio from '../models/portfolio.model.js';
import PortfolioHolding from '../models/portfolioHolding.model.js';
import WalletTransaction from '../models/walletTransaction.model.js';

// Services
import { getAssetPriceSymbol, getAssetPricesByIds } from './market.service.js';
import { emitToUser } from '../socket.js';


const INITIAL_BALANCE = 10000;

/**
 * Helper to handle transactions gracefully on standalone MongoDB instances (like local dev)
 * Transactions require a Replica Set. If not present, we fall back to non-transactional execution.
 */
const runInTransaction = async (work) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (error) {
    // If sessions are not supported at all, run without session
    return await work(null);
  }

  try {
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // Ignore abort errors
      }
    }

    // Check for the specific Replica Set error and retry without transaction
    if (error.message.includes('replica set member or mongos')) {
      return await work(null);
    }
    
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};


/**
 * @desc Buy an asset and update portfolio and wallet accordingly
 * @param {String} userId - ID of the user making the trade
 * @param {Object} { symbol, quantity } - Trade details including symbol and quantity
 * @returns {Object} - Details of the executed trade
 * @throws {ApiError} - Throws error if asset not found, insufficient balance, or any other issue during transaction
*/
export const buyAsset = async (userId, { symbol, quantity }) => {
  return await runInTransaction(async (session) => {
    const asset = await Asset.findOne({ symbol: symbol.toUpperCase() }).session(session);
    if (!asset) throw new ApiError(404, 'Asset not found');

    const priceData = await getAssetPriceSymbol(symbol);
    const currentPrice = priceData.current_price;
    if (currentPrice === 0) throw new ApiError(404, 'Price unavailable for this asset');
    
    const totalCost = currentPrice * quantity;

    let portfolio = await Portfolio.findOne({ userId }).session(session);
    if (!portfolio) {
      portfolio = new Portfolio({ userId, totalBalance: INITIAL_BALANCE, totalAssets: 0, totalProfitLoss: 0 });
      await portfolio.save({ session });
    }

    if (portfolio.totalBalance < totalCost) throw new ApiError(400, 'Insufficient balance');

    let holding = await PortfolioHolding.findOne({ portfolioId: portfolio._id, assetId: asset._id }).session(session);
    if (holding) {
      const newQuantity = holding.quantity + quantity;
      const newAvgPrice = ((holding.averageBuyPrice * holding.quantity) + totalCost) / newQuantity;
      holding.quantity = newQuantity;
      holding.averageBuyPrice = newAvgPrice;
      await holding.save({ session });
    } else {
      holding = new PortfolioHolding({
        portfolioId: portfolio._id,
        assetId: asset._id,
        quantity,
        averageBuyPrice: currentPrice
      });
      await holding.save({ session });
    }

    const trade = new Trade({
      userId,
      assetId: asset._id,
      tradeType: 'BUY',
      quantity,
      price: currentPrice,
      totalAmount: totalCost,
      status: 'COMPLETED',
      executedAt: new Date()
    });
    await trade.save({ session });

    const balanceBefore = portfolio.totalBalance;
    portfolio.totalBalance -= totalCost;
    portfolio.totalAssets += quantity;
    await portfolio.save({ session });

    const walletTx = new WalletTransaction({
      userId,
      transactionType: 'BUY',
      amount: totalCost,
      balanceBefore,
      balanceAfter: portfolio.totalBalance,
      description: `Bought ${quantity} of ${asset.name} (${asset.symbol})`,
      referenceId: trade._id.toString()
    });
    await walletTx.save({ session });

    const result = { tradeId: trade._id, symbol: asset.symbol, quantity, message: `Successfully bought ${quantity} ${asset.symbol}` };
    
    // Emit portfolio update
    getPortfolio(userId).then(portfolioData => {
      emitToUser(userId, "portfolio-update", portfolioData.data);
    });

    return result;
  });
};


/**
 * @desc Sell an asset and update portfolio and wallet accordingly
 * @param {String} userId - ID of the user making the trade
 * @param {Object} { symbol, quantity } - Trade details including symbol and quantity
 * @returns {Object} - Details of the executed trade
 * @throws {ApiError} - Throws error if asset not found, insufficient holdings, or any other issue during transaction
*/
export const sellAsset = async (userId, { symbol, quantity }) => {
  return await runInTransaction(async (session) => {
    const asset = await Asset.findOne({ symbol: symbol.toUpperCase() }).session(session);
    if (!asset) throw new ApiError(404, 'Asset not found');

    const priceData = await getAssetPriceSymbol(symbol);
    const currentPrice = priceData.current_price;
    if (currentPrice === 0) throw new ApiError(404, 'Price unavailable for this asset');

    const portfolio = await Portfolio.findOne({ userId }).session(session);
    if (!portfolio) throw new ApiError(404, 'Portfolio not found');

    const holding = await PortfolioHolding.findOne({ portfolioId: portfolio._id, assetId: asset._id }).session(session);
    if (!holding || holding.quantity < quantity) throw new ApiError(400, 'Insufficient holdings to sell');

    const totalSellValue = currentPrice * quantity;
    const balanceBefore = portfolio.totalBalance;
    const realizedPnL = totalSellValue - (holding.averageBuyPrice * quantity);

    if (holding.quantity === quantity) {
      await holding.deleteOne({ session });
    } else {
      holding.quantity -= quantity;
      await holding.save({ session });
    }

    const trade = new Trade({
      userId,
      assetId: asset._id,
      tradeType: 'SELL',
      quantity,
      price: currentPrice,
      totalAmount: totalSellValue,
      status: 'COMPLETED',
      executedAt: new Date(),
      realizedPnL
    });
    await trade.save({ session });

    portfolio.totalBalance += totalSellValue;
    portfolio.totalAssets -= quantity;
    await portfolio.save({ session });

    const walletTx = new WalletTransaction({
      userId,
      transactionType: 'SELL',
      amount: totalSellValue,
      balanceBefore,
      balanceAfter: portfolio.totalBalance,
      description: `Sold ${quantity} of ${asset.name} (${asset.symbol})`,
      referenceId: trade._id.toString()
    });
    await walletTx.save({ session });

    const result = { newBalance: portfolio.totalBalance, totalReceived: totalSellValue, message: `Successfully sold ${quantity} ${asset.symbol}` };
    
    // Emit portfolio update
    getPortfolio(userId).then(portfolioData => {
      emitToUser(userId, "portfolio-update", portfolioData.data);
    });

    return result;
  });
};

/**
 * @desc Retrieve the user's portfolio details including cash balance, invested value, current portfolio value, profit/loss, and holdings
 * @param {String} userId - ID of the user whose portfolio is being retrieved
 * @returns {Object} - Portfolio details including cash balance, invested value, current portfolio value, profit/loss, and holdings
 * @throws {ApiError} - Throws error if any issue occurs while retrieving portfolio details
*/
export const getPortfolio = async (userId) => {
  const portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) {
    const newPortfolio = new Portfolio({ userId, totalBalance: INITIAL_BALANCE, totalAssets: 0, totalProfitLoss: 0 });
    await newPortfolio.save();
    return {
      data: {
        cash_balance: INITIAL_BALANCE,
        total_invested_value: 0,
        total_portfolio_value: INITIAL_BALANCE,
        total_profit_loss: 0,
        total_profit_loss_percentage: '0.00',
        holdings: []
      },
      status: 201,
      message: 'Portfolio created successfully'
    };
  }

  const holdings = await PortfolioHolding.find({ portfolioId: portfolio._id }).populate({ path: 'assetId' });
  const assetIds = holdings
    .map((h) => h.assetId?.assetId)
    .filter((id) => typeof id === 'string' && id.length > 0);

  const livePrices = await getAssetPricesByIds(assetIds);

  let totalCurrentValue = 0;
  const holdingsWithDetails = holdings.map((h) => {
    const asset = h.assetId || {};
    const livePrice = asset.assetId ? livePrices[asset.assetId]?.usd : undefined;
    const currentPrice = typeof livePrice === 'number' ? livePrice : asset.currentPrice || 0;
    const currentValue = currentPrice * h.quantity;
    const invested = (h.averageBuyPrice || 0) * h.quantity;
    const profitLoss = currentValue - invested;
    totalCurrentValue += currentValue;
    const profitLossPct = invested > 0 ? (profitLoss / invested) * 100 : 0;
    return {
      symbol: asset.symbol || null,
      name: asset.name || null,
      quantity: h.quantity,
      avg_buy_price: h.averageBuyPrice || 0,
      current_price: currentPrice,
      current_value: Number(currentValue.toFixed(2)),
      profit_loss: Number(profitLoss.toFixed(2)),
      profit_loss_percentage: profitLossPct.toFixed(2)
    };
  });

  const cashBalance = typeof portfolio.totalBalance === 'number' ? portfolio.totalBalance : 0;
  const totalPortfolioValue = Number((cashBalance + totalCurrentValue).toFixed(2));
  const totalProfitLoss = Number((totalPortfolioValue - INITIAL_BALANCE).toFixed(2));
  const totalProfitLossPct = ((totalProfitLoss / INITIAL_BALANCE) * 100).toFixed(2);

  return {
    data: {
      cash_balance: Number(cashBalance.toFixed(2)),
      total_invested_value: Number(totalCurrentValue.toFixed(2)),
      total_portfolio_value: totalPortfolioValue,
      total_profit_loss: totalProfitLoss,
      total_profit_loss_percentage: totalProfitLossPct,
      holdings: holdingsWithDetails
    },
    status: 200,
    message: 'Portfolio retrieved successfully'
  };
};

/**
 * @desc Retrieve paginated trade history for a user
 * @param {String} userId
 * @param {Number} page
 * @param {Number} perPage
 * @returns {Object} - { data: trades[], status, message }
 */
export const getTradeHistory = async (userId, page = 1, perPage = 20) => {
  const skip = (Math.max(1, page) - 1) * perPage;
  const trades = await Trade.find({ userId })
    .sort({ executedAt: -1 })
    .skip(skip)
    .limit(perPage)
    .populate({ path: 'assetId' })
    .lean();

  const mapped = trades.map((t) => {
    const asset = t.assetId || {};
    return {
      id: t._id.toString(),
      type: t.tradeType,
      asset: asset.symbol || null,
      name: asset.name || null,
      quantity: t.quantity,
      priceAtTrade: t.price,
      totalUsd: t.totalAmount,
      executedAt: t.executedAt || t.createdAt || t.updatedAt,
      pnl: t.realizedPnL
    };
  });

  return {
    data: mapped,
    status: 200,
    message: 'Trade history retrieved successfully'
  };
};

export default { buyAsset, sellAsset, getPortfolio, getTradeHistory };
