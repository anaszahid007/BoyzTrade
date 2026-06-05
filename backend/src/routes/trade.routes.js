import express from 'express';

// Middleware
import { protect } from '../middleware/auth.middleware.js';
import {validate} from '../middleware/validate.middleware.js';

// Validators
import { validateTrade } from '../validators/trade.validator.js';

// Controllers
import { buyAsset, sellAsset, getPortfolio, getTradeHistory } from '../controllers/trade.controller.js';


const router = express.Router();


// Middleware for Auth user
router.use(protect);


/**
 * @route POST /api/trade/buy
 * @desc Buy an asset
 * @access Private
 * @input { symbol, quantity }
 */
router.post('/buy', validate(validateTrade), buyAsset);

/**
 * @route POST /api/trade/sell
 * @desc Sell an asset
 * @access Private
 * @input { symbol, quantity }
 */
router.post('/sell', validate(validateTrade), sellAsset);

/**
 * @route GET /api/trade/portfolio
 * @desc Get user's portfolio with holdings and performance
 * @access Private
 */
router.get('/portfolio', getPortfolio);

/**
 * @route GET /api/trade/history
 * @desc Get user's trade history
 * @access Private
 */
router.get('/history', getTradeHistory);

export default router;