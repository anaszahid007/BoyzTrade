import Asset from '../models/asset.model.js';
import {
    getAllMarketsAssets,
    getOrCreateAssetBySymbol
} from '../services/market.service.js';
import asyncHandler from '../utils/asyncHandler.js';


export const getAllAssets = asyncHandler(async (req, res) => {
    const query = (req.query.q || '').toString().trim().toLowerCase();
    const page = parseInt(req.query.page?.toString() || '1', 10) || 1;
    const perPage = parseInt(req.query.perPage?.toString() || '50', 10) || 50;

    const assets = await getAllMarketsAssets(page, perPage);

    if (!query) {
        return res.json({ success: true, data: assets });
    }

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
});


export const getAssetBySymbol = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    const asset = await getOrCreateAssetBySymbol(symbol);
    return res.json({ success: true, data: asset });
});
