import Asset from '../../models/asset.model.js';
import ErrorResponse from '../../utils/ErrorResponse.js';

/**
 * Fetch a paginated list of assets with optional search by symbol or name.
 * @param {Object} options
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.limit=20] - Results per page.
 * @param {string} [options.search=''] - Search term for symbol or name.
 * @returns {Promise<{data: Object[], pagination: Object}>} Paginated assets.
 */
export const getGlobalAssets = async ({ page = 1, limit = 20, search = '' }) => {
  const query = {};

  if (search) {
    query.$or = [
      { symbol: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [assets, total] = await Promise.all([
    Asset.find(query).sort({ symbol: 1 }).skip(skip).limit(limit).lean(),
    Asset.countDocuments(query)
  ]);

  return {
    data: assets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Create a new tradeable asset. Validates required fields and checks for
 * duplicate symbols before inserting.
 * @param {Object} assetData
 * @param {string} assetData.symbol - Asset symbol (e.g. 'BTC').
 * @param {string} assetData.name - Display name.
 * @param {string} [assetData.marketType='crypto'] - Market category.
 * @param {number} [assetData.currentPrice=0] - Initial price.
 * @param {string} [assetData.logo] - URL to asset logo.
 * @returns {Promise<Object>} Created asset document.
 * @throws {ErrorResponse} 400 if symbol/name missing or duplicate.
 */
export const createAsset = async (assetData) => {
  const { symbol, name, marketType = 'crypto', currentPrice = 0, logo } = assetData;

  if (!symbol || !name) {
    throw new ErrorResponse(400, 'Symbol and Name are required');
  }

  const existing = await Asset.findOne({ symbol: symbol.toUpperCase() });
  if (existing) {
    throw new ErrorResponse(400, `Asset with symbol ${symbol} already exists`);
  }

  const newAsset = await Asset.create({
    assetId: symbol.toLowerCase(),
    symbol: symbol.toUpperCase(),
    name,
    marketType,
    currentPrice,
    logo: logo || `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${symbol.toLowerCase()}.png`
  });

  return newAsset;
};

/**
 * Update an existing asset by its ID.
 * @param {string} assetId - The asset's ObjectId.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object>} Updated asset document.
 * @throws {ErrorResponse} 404 if asset not found.
 */
export const updateAsset = async (assetId, updateData) => {
  const asset = await Asset.findByIdAndUpdate(assetId, updateData, { new: true });
  if (!asset) throw new ErrorResponse(404, 'Asset not found');
  return asset;
};

/**
 * Delete an asset by its ID.
 * @param {string} assetId - The asset's ObjectId.
 * @returns {Promise<{success: boolean, message: string}>}
 * @throws {ErrorResponse} 404 if asset not found.
 */
export const deleteAsset = async (assetId) => {
  const asset = await Asset.findByIdAndDelete(assetId);
  if (!asset) throw new ErrorResponse(404, 'Asset not found');
  return { success: true, message: 'Asset deleted successfully' };
};
