import tradeService from '../services/trade.service.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const buyAsset = async (req, res, next) => {
    try {
        const payload = await tradeService.buyAsset(req.user._id, req.body);
        return ApiResponse.success(res, { tradeId: payload.tradeId }, payload.message, 201);
    } catch (error) {
        return ApiResponse.error(res, error.message, error instanceof ApiError ? error.statusCode : 500);
    }
};

export const sellAsset = async (req, res, next) => {
    try {
        const payload = await tradeService.sellAsset(req.user._id, req.body);
        return ApiResponse.success(res, payload, payload.message, 200);
    } catch (error) {
        return ApiResponse.error(res, error.message, error instanceof ApiError ? error.statusCode : 500);
    }
};

export const getPortfolio = async (req, res, next) => {
    try {
        const payload = await tradeService.getPortfolio(req.user._id);
        return ApiResponse.success(res, payload.data, payload.message, payload.status);
    } catch (error) {
        return ApiResponse.error(res, error.message, error instanceof ApiError ? error.statusCode : 500);
    }
};

export const getTradeHistory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const perPage = parseInt(req.query.perPage, 10) || 20;
        const payload = await tradeService.getTradeHistory(req.user._id, page, perPage);
        return ApiResponse.success(res, payload.data, payload.message, payload.status);
    } catch (error) {
        return ApiResponse.error(res, error.message, error instanceof ApiError ? error.statusCode : 500);
    }
};