import { getAllMarketsAssets, updateAssetsCurrentPrices } from "./market.service.js";
import { broadcast } from "../socket.js";

let broadcastInterval;

export const startPriceBroadcast = () => {
  if (broadcastInterval) return;

  const fetchAndBroadcast = async () => {
    try {
      const assets = await getAllMarketsAssets();
      await updateAssetsCurrentPrices(assets);
      broadcast("price-update", assets);
      console.log("Broadcasted price updates to all clients");
    } catch (error) {
      console.error("Error in price broadcast:", error);
    }
  };

  // Initial fetch
  fetchAndBroadcast();

  // Set interval (30 seconds)
  broadcastInterval = setInterval(fetchAndBroadcast, 30000);
};

export const stopPriceBroadcast = () => {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }
};
