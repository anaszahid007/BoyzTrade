import tradeService from '../services/trade.service.js';
import Response from '../utils/Response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const buyAsset = asyncHandler(async (req, res) => {
    const payload = await tradeService.buyAsset(req.user._id, req.body);
    return Response.success(res, { tradeId: payload.tradeId }, payload.message, 201);
});

export const sellAsset = asyncHandler(async (req, res) => {
    const payload = await tradeService.sellAsset(req.user._id, req.body);
    return Response.success(res, payload, payload.message, 200);
});

export const getPortfolio = asyncHandler(async (req, res) => {
    const payload = await tradeService.getPortfolio(req.user._id);
    return Response.success(res, payload.data, payload.message, payload.status);
});

export const getTradeHistory = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.perPage, 10) || 20;
    const payload = await tradeService.getTradeHistory(req.user._id, page, perPage);
    return Response.success(res, payload.data, payload.message, payload.status);
});