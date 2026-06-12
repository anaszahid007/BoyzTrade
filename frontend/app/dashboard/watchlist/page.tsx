"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { usePrices } from "@/hooks/usePrices";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { watchlistService, WatchlistAsset } from "@/services/watchlist";
import { tradeService, AssetSummary } from "@/services/trade";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function WatchlistPage() {
  const { prices, loading: pricesLoading, refresh } = usePrices();
  const [watchlist, setWatchlist] = useState<WatchlistAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AssetSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const fetchWatchlist = useCallback(async () => {
    try {
      const data = await watchlistService.list();
      setWatchlist(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Merge live prices into watchlist assets
  const watchedAssets = watchlist.map((w) => {
    const live = prices.find((p) => p.symbol === w.symbol);
    return live
      ? { ...w, current_price: live.current_price, price_change_24h: live.price_change_24h }
      : w;
  });

  // Search for assets to add
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await tradeService.getAssets(searchQuery, 1, 20);
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAdd = async (symbol: string) => {
    setWatchlist((prev) => [...prev, { symbol, name: '', current_price: 0, price_change_24h: 0, market_cap: 0, _id: '', addedAt: new Date().toISOString() } as WatchlistAsset]);
    setFeedback({ type: 'success', message: `${symbol} added to watchlist` });
    try {
      await watchlistService.add(symbol);
      fetchWatchlist();
    } catch {
      setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
      setFeedback({ type: 'error', message: `Failed to add ${symbol}` });
    }
  };

  const handleRemove = async (symbol: string) => {
    try {
      await watchlistService.remove(symbol);
      setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
      setFeedback({ type: 'success', message: `${symbol} removed from watchlist` });
    } catch {
      setFeedback({ type: 'error', message: `Failed to remove ${symbol}` });
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg text-xs font-bold shadow-xl border backdrop-blur-md transition-all duration-300 ${
          feedback.type === 'success'
            ? 'bg-success/15 text-success border-success/20'
            : 'bg-danger/15 text-danger border-danger/20'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Your <span className="text-primary">Watchlist</span></h1>
          <p className="text-[11px] text-muted-foreground">Keep track of your favorite assets and potential opportunities.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={refresh} disabled={pricesLoading} className="gap-1.5 px-3 py-1.5 text-[11px] h-auto">
            <RefreshCw className={`w-3 h-3 ${pricesLoading ? "animate-spin" : ""}`} />
            Sync Prices
          </Button>
          <Button onClick={() => setShowAdd(true)} className="gap-1.5 px-3 py-1.5 text-[11px] h-auto">
            <Plus className="w-3 h-3" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { setShowAdd(false); setSearchQuery(""); setSearchResults([]); }}
          onKeyDown={(e) => { if (e.key === "Escape") { setShowAdd(false); setSearchQuery(""); setSearchResults([]); } }}
          tabIndex={-1}
        >
          <div className="bg-[#0b0c10] border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Add Asset</h3>
              <button type="button" onClick={() => { setShowAdd(false); setSearchQuery(""); setSearchResults([]); }} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by symbol or name..."
                className="pl-9 h-9 text-xs"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-0.5">
              {searching ? (
                <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((asset) => {
                  const alreadyWatched = watchlist.some((w) => w.symbol === asset.symbol);
                  return (
                    <button
                      type="button"
                      key={asset.symbol}
                      onClick={() => handleAdd(asset.symbol)}
                      disabled={alreadyWatched}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                        alreadyWatched
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-white/5 cursor-pointer"
                      }`}
                    >
                      {asset.logo ? (
                        <img src={asset.logo} alt={asset.symbol} className="w-6 h-6 rounded-lg" />
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-white/5 grid place-items-center text-[8px] font-bold">{asset.symbol.slice(0, 2)}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold">{asset.symbol}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{asset.name}</p>
                      </div>
                      <span className="text-[10px] font-mono">${(asset.current_price ?? 0).toLocaleString()}</span>
                    </button>
                  );
                })
              ) : searchQuery.trim() ? (
                <div className="py-6 text-center text-xs text-muted-foreground">No assets found</div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">Type to search for assets</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-secondary/20 rounded-xl animate-pulse border border-border" />
          ))
        ) : watchedAssets.length > 0 ? (
          watchedAssets.map((asset, idx) => (
            <motion.div
              key={asset._id}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: idx * 0.1 }}
              className="glass p-4 rounded-xl border border-border hover:border-primary/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-20 h-20 bg-primary/5 blur-[30px] rounded-full group-hover:bg-primary/10 transition-all" />

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  {asset.logo ? (
                    <img src={asset.logo} alt={asset.symbol} className="w-9 h-9 rounded-lg object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">
                      {asset.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold capitalize text-sm">{asset.symbol}</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{asset.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(asset.symbol)}
                  className="p-1.5 text-muted-foreground hover:text-danger transition-colors rounded-lg hover:bg-danger/10 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[8px] text-muted-foreground mb-0.5 uppercase font-bold tracking-tighter">Current Price</p>
                    <p className="text-base font-mono font-bold">
                      ${(asset.current_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${(asset.price_change_24h ?? 0) >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                    {(asset.price_change_24h ?? 0) >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {Math.abs(asset.price_change_24h ?? 0).toFixed(2)}%
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/dashboard/trade/${asset.symbol}`}>
                    <Button className="w-full gap-1.5 rounded-lg h-8 text-[10px]">
                      Trade
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center glass rounded-xl border border-dashed border-border">
            <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-sm font-bold mb-1">Watchlist is Empty</h3>
            <p className="text-[11px] text-muted-foreground mb-4 text-center">Start adding assets to track their performance.</p>
            <Button onClick={() => setShowAdd(true)} className="rounded-lg px-6 text-xs mx-auto">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Browse Assets
            </Button>
          </div>
        )}
      </div>

      {/* Market Movers */}
      <div className="pt-4">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-success" />
          Market Movers
        </h2>
        <div className="glass rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[8px] uppercase tracking-widest text-muted-foreground font-bold">
                  <th className="px-4 py-2.5">Asset</th>
                  <th className="px-4 py-2.5">Price</th>
                  <th className="px-4 py-2.5">24h Change</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[...prices].sort((a, b) => Math.abs(b.price_change_24h) - Math.abs(a.price_change_24h)).slice(0, 5).map((asset) => {
                  const isWatched = watchlist.some((w) => w.symbol === asset.symbol);
                  return (
                  <tr key={asset.symbol} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {asset.logo ? (
                          <img src={asset.logo} alt={asset.symbol} className="w-6 h-6 rounded-lg" />
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-[8px] font-bold uppercase">{asset.symbol}</div>
                        )}
                        <span className="font-bold text-[11px]">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">${(asset.current_price ?? 0).toLocaleString()}</td>
                    <td className={`px-4 py-3 text-xs font-bold ${(asset.price_change_24h ?? 0) >= 0 ? "text-success" : "text-danger"}`}>
                      {(asset.price_change_24h ?? 0).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleAdd(asset.symbol)}
                        disabled={isWatched}
                        className={`p-1.5 transition-colors rounded-lg cursor-pointer ${
                          isWatched
                            ? 'text-success/50 cursor-not-allowed'
                            : 'text-muted-foreground hover:bg-white/10 hover:text-primary'
                        }`}
                        title={isWatched ? 'Already in watchlist' : 'Add to watchlist'}
                      >
                        <Plus className={`w-3 h-3 ${isWatched ? 'opacity-50' : ''}`} />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
