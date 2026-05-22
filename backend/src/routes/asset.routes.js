// routes/asset.routes.js
import express from 'express';
import { getAssetPriceSymbol } from '../services/coingecko.service.js';

const router = express.Router();

// GET /api/assets - List all available assets
router.get('/', async (req, res) => {
    try {

        const coins = await getAssetPriceSymbol('BTC');

        return res.json({ success: true, data: coins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, status: 500 });
    }
});

// // GET /api/assets/:symbol/price - Get real-time price of one asset
// router.get('/:symbol/price', async (req, res) => {
//   try {
//     const { symbol } = req.params;
//     const coins = await getSupportedCoins();
//     const coin = coins.find(c => c.symbol === symbol.toUpperCase());

//     if (!coin) {
//       return res.status(404).json({ success: false, message: 'Asset not found' });
//     }

//     const prices = await getPrices([coin.id]);

//     res.json({
//       success: true,
//       data: {
//         symbol: coin.symbol,
//         current_price: prices[coin.id]?.inr || 0,
//         price_change_24h: prices[coin.id]?.usd_24h_change || 0
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

export default router;