import Asset from '../models/asset.model.js';
import {
    getAllMarketsAssets,
    getOrCreateAssetBySymbol
} from '../services/market.service.js';


/**
 * @route GET /api/assets
 * @desc List all available assets with optional search and pagination
 * @query q: Optional search query to filter assets by symbol or name (case-insensitive)
 * @query page: Optional page number for pagination (default: 1)
 * @query perPage: Optional number of assets per page (default: 50)
 */
export async function getAllAssets(req, res) {
    try {
        const query = (req.query.q || '').toString().trim().toLowerCase();
        const page = parseInt(req.query.page?.toString() || '1', 10) || 1;
        const perPage = parseInt(req.query.perPage?.toString() || '50', 10) || 50;

        const assets = await getAllMarketsAssets(page, perPage);

        // No query — return all assets directly (dashboard overview, trade list)
        if (!query) {
            return res.json({ success: true, data: assets });
        }

        // Query exists — filter CoinGecko results + search DB for broader coverage
        const coinGeckoMatched = assets.filter((asset) =>
            asset.symbol.toLowerCase().includes(query) ||
            asset.name.toLowerCase().includes(query)
        );

        let dbMatched = [];
        const dbAssets = await Asset.find({
            $or: [
                { symbol: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        }).lean();

        dbMatched = dbAssets.map(a => ({
            symbol: a.symbol,
            name: a.name,
            market_type: a.marketType,
            current_price: a.currentPrice,
            logo: a.logo,
            market_cap: a.metadata?.market_cap || 0,
            price_change_24h: 0,
            last_updated: a.updatedAt?.toISOString() || new Date().toISOString()
        }));

        const seen = new Set(coinGeckoMatched.map(a => a.symbol.toUpperCase()));
        const combined = [...coinGeckoMatched, ...dbMatched.filter(a => !seen.has(a.symbol.toUpperCase()))];

        return res.json({ success: true, data: combined });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, status: 500 });
    }
}


/**
 * @route GET /api/assets/:symbol
 * @desc Get specific asset by symbol (or create if not exists)
 * @param {string} symbol - The symbol of the asset to retrieve (e.g., BTC, ETH)
 * @returns {object} Asset details or error message
 */
export async function getAssetBySymbol(req, res) {
    try {
        const { symbol } = req.params;
        const asset = await getOrCreateAssetBySymbol(symbol);
        return res.json({ success: true, data: asset });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ success: false, message: error.message, status: statusCode });
    }
}
