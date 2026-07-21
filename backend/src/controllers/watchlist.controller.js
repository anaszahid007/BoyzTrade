import * as watchlistService from '../services/watchlist.service.js';
import Response from '../utils/Response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const data = await watchlistService.getWatchlist(req.user._id);
  return Response.success(res, { watchlist: data }, 'Watchlist retrieved');
});

export const add = asyncHandler(async (req, res) => {
  const { symbol } = req.body;
  const entry = await watchlistService.addToWatchlist(req.user._id, symbol);
  return Response.success(res, entry, `${symbol} added to watchlist`);
});

export const remove = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  await watchlistService.removeFromWatchlist(req.user._id, symbol);
  return Response.success(res, null, `${symbol} removed from watchlist`);
});
