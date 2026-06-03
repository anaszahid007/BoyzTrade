"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Trash2,
  Plus,
  RefreshCw,
  Search
} from "lucide-react";
import { usePrices } from "@/hooks/usePrices";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function WatchlistPage() {
  const { prices, loading, refresh } = usePrices();

  // For now, let's mock the "watched" state by taking a subset of prices
  // In a real scenario, this would come from a user's Firestore document
  const watchlistSymbols = ["BTC", "ETH", "SOL", "ADA"];
  const watchedAssets = prices.filter((p) => watchlistSymbols.includes(p.symbol));

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your <span className="text-primary">Watchlist</span></h1>
          <p className="text-muted-foreground">Keep track of your favorite assets and potential opportunities.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={refresh} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Prices
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Filter your watchlist..." 
          className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
        />
      </div>

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && watchedAssets.length === 0 ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-secondary/20 rounded-[2rem] animate-pulse border border-border" />
          ))
        ) : watchedAssets.length > 0 ? (
          watchedAssets.map((asset, idx) => (
            <motion.div
              key={asset.symbol}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-[2rem] border border-border hover:border-primary/20 transition-all group relative overflow-hidden"
            >
              {/* Background Glow Effect */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 blur-[40px] rounded-full group-hover:bg-primary/10 transition-all" />

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold capitalize text-lg">{asset.symbol}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Crypto Asset</p>
                  </div>
                </div>
                <button className="p-2 text-muted-foreground hover:text-danger transition-colors rounded-lg hover:bg-danger/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-tighter">Current Price</p>
                    <p className="text-2xl font-mono font-bold">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg ${asset.change24h >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(asset.change24h).toFixed(2)}%
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <Link href={`/dashboard/trade?asset=${asset.symbol}`} className="flex-1">
                    <Button className="w-full gap-2 rounded-xl h-11">
                      Trade
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="secondary" className="px-3 rounded-xl h-11 border-border">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass rounded-[3rem] border border-dashed border-border">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-xl font-bold mb-2">Watchlist is Empty</h3>
            <p className="text-muted-foreground mb-8">You haven't added any assets to your watchlist yet.</p>
            <Button className="rounded-xl px-8">Browse Markets</Button>
          </div>
        )}
      </div>

      {/* Suggested Section */}
      <div className="pt-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-success" />
          Market Movers
        </h2>
        <div className="glass rounded-[2rem] border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">24h Change</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {Object.entries(prices).slice(5, 10).map(([id, data]: [string, any]) => (
                  <tr key={id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold uppercase">
                          {data.symbol}
                        </div>
                        <span className="font-bold capitalize text-sm">{id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      ${data.current_price.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold ${data.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}`}>
                      {data.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
