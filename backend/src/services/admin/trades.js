import Trade from '../../models/trade.model.js';
import Asset from '../../models/asset.model.js';

/**
 * Fetch a paginated list of all trades with optional filters for symbol,
 * trade type, status, and userId. Populates user and asset references.
 * @param {Object} options
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.limit=20] - Results per page.
 * @param {string} [options.symbol=''] - Asset symbol filter.
 * @param {string} [options.type=''] - Trade type filter (e.g. 'BUY', 'SELL').
 * @param {string} [options.status=''] - Trade status filter.
 * @param {string} [options.userId=''] - User ID filter.
 * @returns {Promise<{data: Object[], pagination: Object}>} Paginated trades.
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
