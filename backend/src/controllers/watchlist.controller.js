import * as watchlistService from '../services/watchlist.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const data = await watchlistService.getWatchlist(req.user._id);
  return ApiResponse.success(res, { watchlist: data }, 'Watchlist retrieved');
});

export const add = asyncHandler(async (req, res) => {
  const { symbol } = req.body;
  const entry = await watchlistService.addToWatchlist(req.user._id, symbol);
  return ApiResponse.success(res, entry, `${symbol} added to watchlist`);
});

export const remove = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  await watchlistService.removeFromWatchlist(req.user._id, symbol);
  return ApiResponse.success(res, null, `${symbol} removed from watchlist`);
});
