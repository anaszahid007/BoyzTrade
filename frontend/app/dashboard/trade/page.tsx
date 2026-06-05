"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePortfolio } from "@/hooks/usePortfolio";
import { tradeService, AssetSummary } from "@/lib/trade";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function TradePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialAsset = searchParams.get("asset") || "BTC";

  const { portfolio } = usePortfolio();
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(initialAsset);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.symbol === selectedSymbol) ?? null,
    [assets, selectedSymbol]
  );

  useEffect(() => {
    if (assets.length && initialAsset) {
      setSelectedSymbol(initialAsset);
    }
  }, [assets, initialAsset]);

  async function loadAssets(query = "") {
    setLoadingAssets(true);
    try {
      const data = await tradeService.getAssets(query, 1, 100);
      setAssets(data);
      if (!data.some((asset) => asset.symbol === selectedSymbol)) {
        setSelectedSymbol(data[0]?.symbol || "BTC");
      }
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

  const assetHolding = portfolio?.holdings.find((h) => h.symbol === selectedSymbol);
  const currentPrice = selectedAsset?.current_price || 0;
  const availableBalance = portfolio?.cash_balance || 0;
  const maxSpendable = tradeType === "BUY" ? availableBalance / (currentPrice || 1) : assetHolding?.quantity || 0;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setStatus(null);
    setLoading(true);

    try {
      const quantity = parseFloat(amount);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error("Enter a valid quantity to trade.");
      }

      if (tradeType === "BUY") {
        await tradeService.buyAsset(selectedAsset.symbol, quantity);
      } else {
        await tradeService.sellAsset(selectedAsset.symbol, quantity);
      }

      setStatus({
        type: "success",
        message: `Successfully ${tradeType === "BUY" ? "bought" : "sold"} ${quantity} ${selectedAsset.symbol}!`,
      });
      setAmount("");
    } catch (err: any) {
      console.error("Trade error:", err);
      setStatus({
        type: "error",
        message: err.message || "An error occurred during the trade.",
      });
    } finally {
      setLoading(false);
    }
  };

  const estimatedValue = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return "0.00";
    return (val * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-8">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Market Trade List</h1>
            <p className="text-muted-foreground">Browse live crypto assets and trade directly from the list. Data is fetched dynamically from the backend.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search symbol or name"
                className="pl-11"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-2 space-y-6">
          <div className="glass overflow-hidden rounded-[2rem] border border-white/5">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold">Assets</h2>
                <p className="text-sm text-muted-foreground">Click an asset to select it for trading.</p>
              </div>
              <span className="text-xs text-muted-foreground">Showing {assets.length} assets</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground border-b border-white/5 bg-[#0b0c10]">
                    <th className="px-6 py-4">Asset</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">24h</th>
                    <th className="px-6 py-4">Market Cap</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAssets ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">Loading assets...</td>
                    </tr>
                  ) : assets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">No assets found.</td>
                    </tr>
                  ) : (
                    assets.map((asset) => {
                      const isActive = asset.symbol === selectedSymbol;
                      return (
                        <tr
                          key={asset.symbol}
                          onClick={() => setSelectedSymbol(asset.symbol)}
                          className={`group cursor-pointer transition-all ${isActive ? 'bg-primary/10' : 'hover:bg-white/5'}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {asset.logo ? (
                                <img src={asset.logo} alt={asset.symbol} className="w-9 h-9 rounded-xl object-cover" />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-white/5 grid place-items-center text-xs font-bold text-muted-foreground">{asset.symbol.slice(0, 2)}</div>
                              )}
                              <div>
                                <p className="font-bold">{asset.symbol}</p>
                                <p className="text-xs text-muted-foreground">{asset.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono">${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className={`px-6 py-4 font-bold ${asset.price_change_24h >= 0 ? 'text-success' : 'text-danger'}`}>
                            {asset.price_change_24h?.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">${asset.market_cap.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => router.push(`/dashboard/trade/${asset.symbol}`)}
                              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 hover:bg-primary/20 px-3 py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              Trade
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
