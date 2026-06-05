import { getAllMarketsAssets, getOrCreateAssetBySymbol } from '../services/market.service.js';


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
        const filteredAssets = query
            ? assets.filter((asset) =>
                asset.symbol.toLowerCase().includes(query) ||
                asset.name.toLowerCase().includes(query)
            )
            : assets;

        return res.json({ success: true, data: filteredAssets });
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
