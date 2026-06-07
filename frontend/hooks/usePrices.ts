"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { tradeService, AssetSummary } from "@/services/trade";

interface UsePricesOptions {
  perPage?: number;
}

const mergePriceUpdates = (
  current: AssetSummary[],
  updates: AssetSummary[]
): AssetSummary[] => {
  if (!updates.length) return current;
  if (!current.length) return updates;

  const updateMap = new Map(updates.map((asset) => [asset.symbol, asset]));

  return current.map((asset) => {
    const updated = updateMap.get(asset.symbol);
    if (!updated) return asset;
    return {
      ...asset,
      current_price: updated.current_price ?? asset.current_price,
      price_change_24h: updated.price_change_24h ?? asset.price_change_24h,
      market_cap: updated.market_cap ?? asset.market_cap,
      last_updated: updated.last_updated ?? asset.last_updated,
    };
  });
};

export function usePrices({ perPage = 50 }: UsePricesOptions = {}) {
  const { socket } = useSocket();
  const [prices, setPrices] = useState<AssetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tradeService.getAssets("", 1, perPage);
      setPrices(data);
      setError(null);
    } catch (err: unknown) {
      console.error("Error fetching prices:", err);
      setError("Failed to fetch live prices.");
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    if (!socket) return;

    const handlePriceUpdate = (updates: AssetSummary[]) => {
      setPrices((current) => mergePriceUpdates(current, updates));
    };

    socket.on("price-update", handlePriceUpdate);
    return () => {
      socket.off("price-update", handlePriceUpdate);
    };
  }, [socket]);

  return { prices, loading, error, refresh: fetchPrices };
}
