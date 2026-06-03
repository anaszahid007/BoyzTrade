"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

const ids = [
  { symbol: "BTC", id: "bitcoin" },
  { symbol: "ETH", id: "ethereum" },
  { symbol: "SOL", id: "solana" },
  { symbol: "DOGE", id: "dogecoin" },
  { symbol: "ADA", id: "cardano" },
];

export function usePrices() {
  const { socket } = useSocket();
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids
        .map((item) => item.id)
        .join(",")}&vs_currencies=usd&include_24hr_change=true`;
      const response = await fetch(url);
      const data = await response.json();

      const formattedPrices = ids.map((asset) => ({
        symbol: asset.symbol,
        price: data[asset.id]?.usd ?? 0,
        change24h: Number(data[asset.id]?.usd_24h_change?.toFixed(2) ?? 0),
      }));

      setPrices(formattedPrices);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching prices:", err);
      setError("Failed to fetch live prices.");
      setPrices([
        { symbol: "BTC", price: 65432.1, change24h: 2.45 },
        { symbol: "ETH", price: 3456.78, change24h: -1.2 },
        { symbol: "SOL", price: 145.2, change24h: 5.67 },
        { symbol: "DOGE", price: 0.154, change24h: -0.45 },
        { symbol: "ADA", price: 0.456, change24h: 1.1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();

    if (socket) {
      socket.on("price-update", (assets: any[]) => {
        const formattedPrices = ids.map((asset) => {
          const match = assets.find((a) => a.symbol === asset.symbol);
          return {
            symbol: asset.symbol,
            price: match?.current_price || 0,
            change24h: match?.price_change_24h || 0,
          };
        });
        setPrices(formattedPrices);
      });
    }

    return () => {
      if (socket) {
        socket.off("price-update");
      }
    };
  }, [socket]);

  return { prices, loading, error, refresh: fetchPrices };
}
