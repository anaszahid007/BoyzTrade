// routes/asset.routes.js
import express from 'express';
import { getAllAssets, getAssetBySymbol } from '../controllers/asset.controller.js';

const router = express.Router();


/**
 * @route GET /api/assets
 * @desc List all available assets with optional search and pagination
 * @query q: Optional search query to filter assets by symbol or name (case-insensitive)
*/
router.get('/', getAllAssets);


/**
 * @route GET /api/assets/:symbol
 * @desc Get specific asset by symbol (or create if not exists)
 * @param {string} symbol - The symbol of the asset to retrieve (e.g., BTC, ETH)
 * @returns {object} Asset details or error message
*/
router.get('/:symbol', getAssetBySymbol);


export default router;