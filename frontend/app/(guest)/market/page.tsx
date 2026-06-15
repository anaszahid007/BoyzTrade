"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp,
  Search, 
  RefreshCw,
  BarChart2,
  Activity,
  Globe,
  Zap
} from "lucide-react";
import { usePrices } from "@/hooks/usePrices";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

function formatCompact(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

export default function MarketPage() {
  const { prices, loading, refresh } = usePrices({ perPage: 50 });

  const totalMarketCap = prices.reduce((sum, a) => sum + (a.market_cap || 0), 0);
  const totalVolume = prices.reduce((sum, a) => sum + (a.total_volume || 0), 0);
  const btc = prices.find((a) => a.symbol === "BTC");
  const btcDominance = btc?.market_cap && totalMarketCap > 0
    ? (btc.market_cap / totalMarketCap) * 100
    : null;

  const marketStats = [
    {
      label: "Global Market Cap",
      value: totalMarketCap > 0 ? formatCompact(totalMarketCap) : "—",
      change: btc?.price_change_24h != null
        ? `${btc.price_change_24h >= 0 ? "+" : ""}${btc.price_change_24h.toFixed(1)}%`
        : null,
      icon: Globe,
    },
    {
      label: "24h Trading Volume",
      value: totalVolume > 0 ? formatCompact(totalVolume) : "—",
      change: null,
      icon: BarChart2,
    },
    {
      label: "BTC Dominance",
      value: btcDominance != null ? `${btcDominance.toFixed(1)}%` : "—",
      change: btc?.price_change_24h != null
        ? `${btc.price_change_24h >= 0 ? "+" : ""}${btc.price_change_24h.toFixed(1)}%`
        : null,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-bg-dark text-foreground">
      {/* Hero Header */}
      <section className="relative pt-32 pb-16 px-6 border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-success/10 blur-[120px] rounded-full opacity-30" />
          <div className="absolute bottom-0 left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-bold uppercase tracking-widest"
            >
              <Activity className="w-3 h-3" />
              Live Market Data
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Market <span className="text-success drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Overview</span></h1>
            <p className="text-muted-foreground max-w-xl">
              Track real-time prices for the most popular cryptocurrencies. Powered by our backend with live updates every minute.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <Button variant="secondary" onClick={refresh} disabled={loading} className="px-4 py-2 border-white/10 hover:border-success/30">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
             </Button>
             <Link href="/auth/register">
               <Button className="px-6 py-2">Trade Now</Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Market Stats Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {marketStats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-3xl border border-white/5 hover:border-success/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/5 rounded-xl group-hover:bg-success/10 transition-colors">
                  <stat.icon className="w-5 h-5 text-muted-foreground group-hover:text-success transition-colors" />
                </div>
                {stat.change != null && (
                  <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">
                {loading && stat.value === "—" ? (
                  <span className="inline-block w-24 h-7 rounded-md bg-white/5 animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Market Table */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="text-xl font-bold">Top Cryptocurrencies</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search assets..." 
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-success transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    <th className="px-8 py-5">Asset</th>
                    <th className="px-8 py-5">Price</th>
                    <th className="px-8 py-5">24h Change</th>
                    {/* <th className="px-8 py-5">24h Volume</th> */}
                    <th className="px-8 py-5">Market Cap</th>
                    <th className="px-8 py-5">—</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading && prices.length === 0 ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-8 py-6 h-20 bg-white/[0.01]" />
                      </tr>
                    ))
                  ) : (
                    prices.map((asset, idx) => (
                      <motion.tr 
                        key={asset.symbol}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            {asset.logo ? (
                              <img src={asset.logo} alt={asset.symbol} className="w-10 h-10 rounded-xl object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center font-bold text-xs">
                                {asset.symbol}
                              </div>
                            )}
                            <div>
                              <p className="font-bold">{asset.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{asset.symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-mono font-bold">
                          ${(asset.current_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`flex items-center gap-1 text-sm font-bold ${(asset.price_change_24h ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                            {(asset.price_change_24h ?? 0) >= 0 ? '+' : ''}
                            {Math.abs(asset.price_change_24h ?? 0).toFixed(2)}%
                          </span>
                        </td>
                        {/* <td className="px-8 py-6 text-sm text-muted-foreground">
                          —
                        </td> */}
                        <td className="px-8 py-6 text-sm text-muted-foreground">
                          ${(asset.market_cap / 1000000000).toFixed(2)}B
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Link href={`/auth/register`}>
                            <Button variant="ghost" className="hover:text-success p-2">
                              <Zap className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-8 border-t border-white/5 text-center">
               <p className="text-xs text-muted-foreground italic flex items-center justify-center gap-2">
                 <Globe className="w-3 h-3" />
                 Market data is provided for educational simulation only and may be delayed.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Market Education CTA */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto glass p-16 rounded-[4rem] border border-success/10 bg-gradient-to-br from-success/5 to-transparent text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Don&apos;t just watch. <span className="text-success">Practice.</span></h2>
           <p className="text-lg text-muted-foreground max-w-xl mx-auto">
             Watching prices is the first step. Executing trades is where the real learning happens. Get $10,000 in virtual funds now.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button className="px-10 py-4 text-lg rounded-2xl">Start Your Journey</Button>
              </Link>
              <Link href="/about">
                <Button variant="secondary" className="px-10 py-4 text-lg rounded-2xl border-white/10">Learn Mechanics</Button>
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
}
