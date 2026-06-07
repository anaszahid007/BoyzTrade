import axios from "axios";
import ApiError from "../utils/ApiError.js";
import Asset from "../models/asset.model.js";
import { getCachedValue, setCachedValue, CACHE_TTL } from "../utils/redisCache.js";

// CoinGecko API base URL
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const formatMarketAssets = (coins) =>
    coins.map((coin) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        market_type: 'crypto',
        current_price: coin.current_price,
        logo: coin.image,
        market_cap: coin.market_cap,
        price_change_24h: coin.price_change_percentage_24h,
        last_updated: coin.last_updated,
    }));

const fetchMarketAssetsFromApi = async (page, perPage) => {
    const coinsList = await axios.get(`${COINGECKO_API}/coins/markets`, {
        params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            sparkline: false,
            page,
            per_page: perPage,
        },
    });

    return formatMarketAssets(coinsList.data);
};

/**
 * @desc Get the list of All Markets Assets
 * @param {number} page - The page number for pagination (default: 1)
 * @param {number} perPage - The number of items per page for pagination (default: 50)
 * @param {object} options
 * @param {boolean} options.forceRefresh - Bypass cache and fetch fresh prices (used by broadcast)
 * @returns {Promise<Array>} - A promise resolving to an array of assets with real-time price data
*/
export const getAllMarketsAssets = async (page = 1, perPage = 50, { forceRefresh = false } = {}) => {
    const cacheKey = `assets:list:${page}:${perPage}`;

    if (!forceRefresh) {
        const cached = await getCachedValue(cacheKey);
        if (cached) return cached;
    }

    try {
        const assets = await fetchMarketAssetsFromApi(page, perPage);
        await setCachedValue(cacheKey, assets, CACHE_TTL.MARKET_ASSETS);
        return assets;
    } catch (error) {
        const stale = await getCachedValue(cacheKey);
        if (stale) {
            console.warn(`CoinGecko fetch failed, serving stale cache for ${cacheKey}:`, error.message);
            return stale;
        }
        throw new ApiError(500, 'Failed to fetch assets with real-time price');
    }
}


/**
 * @desc Get Asset price by symbol (e.g., BTC, ETH)
 * @param {string} symbol - The symbol of the asset for which to fetch real-time price
 * @returns {Promise<Object>} - A promise resolving to the real-time price data for the specified asset
 */
export const getAssetPriceSymbol = async (symbol) => {
    try {

        const assetSymbol = await Asset.findOne({ symbol: symbol.toUpperCase() });
        if (!assetSymbol) throw new ApiError(404, 'Asset not found');

        const response = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: assetSymbol.assetId,
                vs_currencies: 'usd',
                include_24hr_change: true,
                include_24hr_vol: true
            }
        });

        return {
            symbol: symbol,
            assetId: assetSymbol.assetId,
            current_price: response.data[assetSymbol.assetId]?.usd || 0,
            price_change_24h: response.data[assetSymbol.assetId]?.usd_24h_change || 0,
        };

    } catch (error) {
        throw new ApiError(500, 'Failed to fetch asset price for the specified asset');
    }
};


/**
 * @desc Get the Price of a specific asset ID (e.g., bitcoin, ethereum) from CoinGecko
 * @param {string} assetId - The ID of the asset for which to fetch real-time price
 * @returns {Promise<number>} - A promise resolving to the current price of the specified asset
*/
export const getAssetPriceById = async (assetId) => {
    try {
        const response = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: assetId,
                vs_currencies: 'usd'
            }
        });

        return response.data[assetId]?.usd;

    } catch (error) {
        throw new ApiError(500, 'Failed to fetch real-time price for the specified asset');
    }
};

export const getAssetPricesByIds = async (assetIds) => {
    try {
        if (!Array.isArray(assetIds) || assetIds.length === 0) {
            return {};
        }

        const ids = [...new Set(assetIds)].sort().join(",");
        const cacheKey = `assetPricesByIds:${ids}`;

        const cached = await getCachedValue(cacheKey);
        if (cached) return cached;

        const response = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
                ids,
                vs_currencies: 'usd'
            }
        });

        const data = response.data || {};
        if (Object.keys(data).length > 0) {
            await setCachedValue(cacheKey, data, CACHE_TTL.MARKET_ASSETS);
        }

        return data;
    } catch (error) {
        console.warn(`CoinGecko rate limit / error in getAssetPricesByIds: ${error.message}`);
        return {}; // Fallback to {} so the portfolio uses DB prices instead of crashing
    }
};

export const updateAssetsCurrentPrices = async (assets) => {
    if (!Array.isArray(assets) || assets.length === 0) {
        return;
    }

    const operations = assets
        .filter((asset) => asset.symbol && typeof asset.current_price === 'number')
        .map((asset) => ({
            updateOne: {
                filter: { symbol: asset.symbol.toUpperCase() },
                update: { currentPrice: asset.current_price },
                upsert: false
            }
        }));

    if (operations.length === 0) {
        return;
    }

    await Asset.bulkWrite(operations, { ordered: false });
};

/**
 * @desc CoinGecko se list of all supported coins fetch karo with pagination support
 * @param {number} page - The page number for pagination (default: 1)
 * @param {number} perPage - The number of items per page for pagination (default: 50)
 * @returns {Promise<Array>} - A promise resolving to an array of supported coins
*/
export const getAllCoins = async (page = 1, perPage = 50) => {
    try {
        const response = await axios.get(`${COINGECKO_API}/coins/list`, {
            params: {
                page: page,
                per_page: perPage
            }
        });
        return response.data;
    } catch (error) {
        throw new ApiError(500, 'Failed to fetch supported coins');
    }
};

/**
 * @desc Get asset by symbol or create it if not found in database
 * @param {string} symbol - The symbol of the asset (e.g., BTC, ETH)
 * @returns {Promise<Object>} - A promise resolving to the asset data with real-time price
*/
export const getOrCreateAssetBySymbol = async (symbol) => {
    try {
        const normalizedSymbol = symbol.toUpperCase();
        const cacheKey = `asset:symbol:${normalizedSymbol}`;

        const cachedAsset = await getCachedValue(cacheKey);
        if (cachedAsset) {
            return cachedAsset;
        }

        // 1. Check if asset exists in database
        let dbAsset = await Asset.findOne({ symbol: normalizedSymbol });

        if (dbAsset) {
            // Asset exists, fetch current market data and return
            try {
                const coinData = await axios.get(`${COINGECKO_API}/simple/price`, {
                    params: {
                        ids: dbAsset.assetId,
                        vs_currencies: 'usd',
                        include_24hr_change: true,
                        include_market_cap: true
                    }
                });

                const priceData = coinData.data[dbAsset.assetId];
                const assetResponse = {
                    symbol: dbAsset.symbol,
                    name: dbAsset.name,
                    market_type: dbAsset.marketType,
                    current_price: priceData?.usd || 0,
                    logo: dbAsset.logo,
                    market_cap: priceData?.usd_market_cap || 0,
                    price_change_24h: priceData?.usd_24h_change || 0,
                    last_updated: new Date().toISOString()
                };

                if (typeof assetResponse.current_price === 'number' && dbAsset.currentPrice !== assetResponse.current_price) {
                    dbAsset.currentPrice = assetResponse.current_price;
                    await dbAsset.save();
                }

                await setCachedValue(cacheKey, assetResponse, CACHE_TTL.ASSET_DETAIL);
                return assetResponse;
            } catch (err) {
                console.error('Error fetching real-time data for existing asset:', err.message);
                const fallbackResponse = {
                    symbol: dbAsset.symbol,
                    name: dbAsset.name,
                    market_type: dbAsset.marketType,
                    current_price: dbAsset.currentPrice || 0,
                    logo: dbAsset.logo,
                    market_cap: 0,
                    price_change_24h: 0,
                    last_updated: dbAsset.updatedAt?.toISOString()
                };

                await setCachedValue(cacheKey, fallbackResponse, CACHE_TTL.ASSET_DETAIL);
                return fallbackResponse;
            }
        }

        // 2. Asset not in database - fetch from CoinGecko and create it
        const searchCacheKey = `asset:search:${normalizedSymbol}`;
        const cachedSearch = await getCachedValue(searchCacheKey);
        let coin;

        if (cachedSearch) {
            coin = cachedSearch;
        } else {
            const searchResponse = await axios.get(`${COINGECKO_API}/search`, {
                params: { query: normalizedSymbol }
            });

            coin = searchResponse.data.coins.find((c) => c.symbol.toUpperCase() === normalizedSymbol) || searchResponse.data.coins[0];
            if (!coin) {
                throw new ApiError(404, `Asset with symbol ${symbol} not found in CoinGecko`);
            }

            await setCachedValue(searchCacheKey, coin, CACHE_TTL.ASSET_SEARCH);
        }

        // 3. Fetch market data for the coin
        const marketData = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: coin.id,
                vs_currencies: 'usd',
                include_24hr_change: true,
                include_market_cap: true
            }
        });

        const priceData = marketData.data[coin.id];

        // 4. Create new asset in database
        const newAsset = await Asset.create({
            assetId: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            marketType: 'crypto',
            currentPrice: priceData?.usd || 0,
            logo: coin.thumb || `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${coin.id}.png`
        });

        const assetResponse = {
            symbol: newAsset.symbol,
            name: newAsset.name,
            market_type: newAsset.marketType,
            current_price: priceData?.usd || 0,
            logo: newAsset.logo,
            market_cap: priceData?.usd_market_cap || 0,
            price_change_24h: priceData?.usd_24h_change || 0,
            last_updated: new Date().toISOString()
        };

        await setCachedValue(cacheKey, assetResponse, CACHE_TTL.ASSET_DETAIL);
        return assetResponse;

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, `Failed to get or create asset: ${error.message}`);
    }
};

