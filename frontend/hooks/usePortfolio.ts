"use client";

import { useState, useEffect, useCallback } from "react";
import { tradeService, PortfolioData } from "@/services/trade";
import { useSocket } from "@/contexts/SocketContext";

export function usePortfolio() {
  const { socket } = useSocket();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tradeService.getPortfolio();
      setPortfolio(data);
    } catch (err: any) {
      console.error("Error fetching portfolio:", err);
      setError(err.message || "Failed to fetch portfolio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  useEffect(() => {
    if (!socket) return;
    const handlePortfolioUpdate = (updatedPortfolio: PortfolioData) => {
      setPortfolio(updatedPortfolio);
    };
    socket.on("portfolio-update", handlePortfolioUpdate);
    return () => {
      socket.off("portfolio-update", handlePortfolioUpdate);
    };
  }, [socket]);

  return {
    portfolio,
    loading,
    error,
    refresh: fetchPortfolio
  };
}
