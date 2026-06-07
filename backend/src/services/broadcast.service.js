import { getAllMarketsAssets, updateAssetsCurrentPrices } from "./market.service.js";
import { BROADCAST_INTERVAL_MS } from "../utils/redisCache.js";
import { broadcast } from "../socket.js";

let broadcastInterval;

export const startPriceBroadcast = () => {
  if (broadcastInterval) return;

  const fetchAndBroadcast = async () => {
    try {
      const assets = await getAllMarketsAssets(1, 50, { forceRefresh: true });
      await updateAssetsCurrentPrices(assets);
      broadcast("price-update", assets);
      console.log("Broadcasted price updates to all clients");
    } catch (error) {
      console.error("Error in price broadcast:", error);
    }
  };

  fetchAndBroadcast();
  broadcastInterval = setInterval(fetchAndBroadcast, BROADCAST_INTERVAL_MS);
};

export const stopPriceBroadcast = () => {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }
};
