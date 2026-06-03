import axios from "axios";
import ApiError from "../utils/ApiError.js";


// Models
import Asset from "../models/asset.model.js";

// CoinGecko API base URL
const COINGECKO_API = 'https://api.coingecko.com/api/v3';


/**
 * @desc Get the list of All Markets Assets
 * @param {number} page - The page number for pagination (default: 1)
 * @param {number} perPage - The number of items per page for pagination (default: 50)
 * @returns {Promise<Array>} - A promise resolving to an array of assets with real-time price data
*/
export const getAllMarketsAssets = async () => {
    try {
        // 1. coin list of all gecko coins
        const coinsList = await axios.get(`${COINGECKO_API}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                sparkline: false,
            }
        });

        // 2. Format karo apne schema ke hisaab se
        const assets = coinsList.data.map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            market_type: 'crypto',
            current_price: coin.current_price,
            logo: coin.image,
            market_cap: coin.market_cap,
            price_change_24h: coin.price_change_percentage_24h,
            last_updated: coin.last_updated
        }));

        return assets;

    } catch (error) {
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

