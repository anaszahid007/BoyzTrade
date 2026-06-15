import Watchlist from '../models/watchlist.model.js';
import Asset from '../models/asset.model.js';
import { getAssetPricesByIds, getOrCreateAssetBySymbol } from './market.service.js';
import ErrorResponse from '../utils/ErrorResponse.js';

export const getWatchlist = async (userId) => {
  const entries = await Watchlist.find({ userId })
    .populate('assetId')
    .sort({ createdAt: -1 })
    .lean();

  if (!entries.length) return [];

  const assetIds = entries
    .map((e) => e.assetId?.assetId)
    .filter((id) => typeof id === 'string' && id.length > 0);

  const livePrices = await getAssetPricesByIds(assetIds);

  return entries.map((entry) => {
    const asset = entry.assetId || {};
    const coinId = asset.assetId;
    const livePrice = coinId ? livePrices[coinId]?.usd : undefined;
    const currentPrice = typeof livePrice === 'number' ? livePrice : asset.currentPrice || 0;
    const change24h = coinId ? livePrices[coinId]?.usd_24h_change || 0 : 0;

    return {
      _id: entry._id,
      symbol: asset.symbol,
      name: asset.name,
      logo: asset.logo,
      current_price: currentPrice,
      price_change_24h: change24h,
      market_cap: asset.metadata?.market_cap || 0,
      addedAt: entry.createdAt,
    };
  });
};

export const addToWatchlist = async (userId, symbol) => {
  const normalizedSymbol = symbol.toUpperCase();

  // Ensure asset exists in DB (create via CoinGecko if needed)
  try {
    await getOrCreateAssetBySymbol(normalizedSymbol);
  } catch {
    throw new ErrorResponse(404, `Asset ${symbol} not found`);
  }

  const asset = await Asset.findOne({ symbol: normalizedSymbol });
  if (!asset) throw new ErrorResponse(404, `Asset ${symbol} not found`);

  const existing = await Watchlist.findOne({ userId, assetId: asset._id });
  if (existing) throw new ErrorResponse(400, `${symbol} is already in your watchlist`);

  const entry = await Watchlist.create({ userId, assetId: asset._id });
  return { _id: entry._id, symbol: asset.symbol };
};

export const removeFromWatchlist = async (userId, symbol) => {
  const asset = await Asset.findOne({ symbol: symbol.toUpperCase() });
  if (!asset) throw new ErrorResponse(404, `Asset ${symbol} not found`);

  const result = await Watchlist.deleteOne({ userId, assetId: asset._id });
  if (result.deletedCount === 0) throw new ErrorResponse(404, `${symbol} not in your watchlist`);
};
