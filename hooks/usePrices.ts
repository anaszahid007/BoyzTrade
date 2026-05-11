"use client";

import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

export function usePrices() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const getPrices = httpsCallable(functions, "getPrices");
      const result: any = await getPrices();
      
      // Converting the object response from PRD into an array
      // PRD says: { BTC: price, ETH: price, ... }
      // Note: Real implementation might return more info like change24h
      const data = result.data;
      const formattedPrices = Object.keys(data)
        .filter(key => key !== 'fetchedAt')
        .map(symbol => ({
          symbol,
          price: data[symbol],
          change24h: (Math.random() * 10) - 5 // Mocking change for UI demo
        }));
        
      setPrices(formattedPrices);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching prices:", err);
      setError("Failed to fetch live prices.");
      
      // Fallback for UI demo if function doesn't exist yet
      setPrices([
        { symbol: "BTC", price: 65432.10, change24h: 2.45 },
        { symbol: "ETH", price: 3456.78, change24h: -1.20 },
        { symbol: "SOL", price: 145.20, change24h: 5.67 },
        { symbol: "DOGE", price: 0.154, change24h: -0.45 },
        { symbol: "ADA", price: 0.456, change24h: 1.10 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // 30s as per PRD
    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error, refresh: fetchPrices };
}
