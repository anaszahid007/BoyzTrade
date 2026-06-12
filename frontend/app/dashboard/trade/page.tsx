"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { tradeService, AssetSummary } from "@/services/trade";
import { Input } from "@/components/ui/Input";
import {
  ArrowUpRight,
  Search,
} from "lucide-react";

export default function TradePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("q") || "";

  const { socket } = useSocket();
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [search, setSearch] = useState(initialSearch);

  async function loadAssets(query = "") {
    setLoadingAssets(true);
    try {
      const data = await tradeService.getAssets(query, 1, 100);
      setAssets(data);
    } catch (error) {
      console.error("Failed to load assets", error);
    } finally {
      setLoadingAssets(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => loadAssets(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadAssets("");
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handlePriceUpdate = (updates: AssetSummary[]) => {
      setAssets((current) => {
        if (!current.length) return current;
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
      });
    };

    socket.on("price-update", handlePriceUpdate);
    return () => {
      socket.off("price-update", handlePriceUpdate);
    };
  }, [socket]);

  return (
    <div className="space-y-4">
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Market Trade List</h1>
            <p className="text-[11px] text-muted-foreground">Browse live crypto assets and trade directly from the list. Data is fetched dynamically from the backend.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search symbol or name"
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <section>
          <div className="glass overflow-hidden rounded-xl border border-white/5">
            <div className="flex items-center justify-between p-3 border-b border-white/5">
              <div>
                <h2 className="text-sm font-bold">Assets</h2>
                <p className="text-[10px] text-muted-foreground">Click an asset to trade.</p>
              </div>
              <span className="text-[10px] text-muted-foreground">Showing {assets.length} assets</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground border-b border-white/5 bg-[#0b0c10]">
                    <th className="px-4 py-2.5">Asset</th>
                    <th className="px-4 py-2.5">Price</th>
                    <th className="px-4 py-2.5">24h</th>
                    <th className="px-4 py-2.5">Market Cap</th>
                    <th className="px-4 py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAssets ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-xs text-muted-foreground">Loading assets...</td>
                    </tr>
                  ) : assets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-xs text-muted-foreground">No assets found.</td>
                    </tr>
                  ) : (
                    assets.map((asset) => (
                      <tr
                        key={asset.symbol}
                        onClick={() => router.push(`/dashboard/trade/${asset.symbol}`)}
                        className="group cursor-pointer hover:bg-white/5 transition-all"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {asset.logo ? (
                              <img src={asset.logo} alt={asset.symbol} className="w-7 h-7 rounded-lg object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-white/5 grid place-items-center text-[9px] font-bold text-muted-foreground">{asset.symbol.slice(0, 2)}</div>
                            )}
                            <div>
                              <p className="font-bold text-xs">{asset.symbol}</p>
                              <p className="text-[9px] text-muted-foreground">{asset.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">${(asset.current_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className={`px-4 py-3 font-bold text-xs ${(asset.price_change_24h ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                          {(asset.price_change_24h ?? 0).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-[11px] text-muted-foreground">${(asset.market_cap ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/trade/${asset.symbol}`); }}
                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 hover:bg-primary/20 px-2.5 py-0.5 text-[9px] text-muted-foreground hover:text-primary transition-colors"
                          >
                            Trade
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
