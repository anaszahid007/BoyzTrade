"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePrices } from "@/hooks/usePrices";
import { usePortfolio } from "@/hooks/usePortfolio";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  PlusCircle,
  RefreshCcw,
  LayoutDashboard,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const { prices: assets, loading: pricesLoading, refresh: refreshPrices } = usePrices({ perPage: 8 });
  const { portfolio, loading: portfolioLoading, refresh: refreshPortfolio } = usePortfolio();

  const loading = pricesLoading || portfolioLoading;

  const refreshAll = () => {
    refreshPrices();
    refreshPortfolio();
  };

  const router = useRouter();

  const stats = {
    balance: portfolio?.cash_balance ?? 0,
    totalValue: portfolio?.total_portfolio_value ?? 0,
    pnl: portfolio?.total_profit_loss ?? 0,
    pnlPercent: portfolio?.total_profit_loss_percentage ?? "0.00"
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Dashboard Overview</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Trading <span className="text-success">Terminal</span></h1>
          <p className="text-[11px] text-muted-foreground max-w-sm">Global crypto market analysis and virtual portfolio management.</p>
        </div>
        <Button variant="secondary" onClick={refreshAll} isLoading={loading} className="w-fit px-3 h-8 rounded-lg border-white/5 hover:border-primary/20 transition-all text-[10px] font-bold">
          <RefreshCcw className={`w-3 h-3 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Market Data
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass p-4 rounded-xl border border-white/5 space-y-3 neon-glow-blue relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
            <DollarSign className="w-16 h-16" />
          </div>
          <div className="space-y-0.5 relative z-10">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Available Balance</p>
            <h2 className="text-2xl font-bold tracking-tighter">${stats.balance.toLocaleString()}</h2>
          </div>
          <div className="flex items-center gap-1.5 text-success text-[8px] font-bold bg-success/10 w-fit px-2 py-0.5 rounded-full border border-success/20">
            <PlusCircle className="w-2.5 h-2.5" />
            <span>VIRTUAL FUNDS</span>
          </div>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 space-y-3 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ArrowUpRight className="w-16 h-16 text-primary" />
          </div>
          <div className="space-y-0.5 relative z-10">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Total Portfolio Value</p>
            <h2 className="text-2xl font-bold tracking-tighter">${stats.totalValue.toLocaleString()}</h2>
          </div>
          <div className="flex items-center gap-1.5 text-primary text-[8px] font-bold bg-primary/10 w-fit px-2 py-0.5 rounded-full border border-primary/20">
            <ArrowUpRight className="w-2.5 h-2.5" />
            <span>NET EQUITY</span>
          </div>
        </div>

        <div className={`glass p-4 rounded-xl border border-white/5 space-y-3 neon-glow-${Number(stats.pnl) >= 0 ? 'green' : 'red'} relative overflow-hidden group hover:scale-[1.01] transition-all duration-500`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            {Number(stats.pnl) >= 0 ? <TrendingUp className="w-16 h-16 text-success" /> : <TrendingDown className="w-16 h-16 text-danger" />}
          </div>
          <div className="space-y-0.5 relative z-10">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Overall Profit/Loss</p>
            <h2 className={`text-2xl font-bold tracking-tighter ${Number(stats.pnl) >= 0 ? 'text-success' : 'text-danger'}`}>
              {Number(stats.pnl) >= 0 ? '+' : ''}${Math.abs(Number(stats.pnl)).toLocaleString()}
            </h2>
          </div>
          <div className={`flex items-center gap-1.5 text-[8px] font-bold w-fit px-2 py-0.5 rounded-full border ${Number(stats.pnl) >= 0 ? 'text-success bg-success/10 border-success/20' : 'text-danger bg-danger/10 border-danger/20'}`}>
            {Number(stats.pnl) >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            <span>{stats.pnlPercent}% RETURN</span>
          </div>
        </div>
      </motion.div>

      {/* Market Prices Table */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-base font-bold tracking-tight">Market Overview</h3>
          </div>
          <Link href="/dashboard/trade" className="group flex items-center gap-1.5 text-[11px] text-primary font-bold hover:underline">
            View All Assets
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="glass rounded-xl border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-muted-foreground text-[8px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-4 py-2.5">Asset</th>
                  <th className="px-4 py-2.5 text-right">Live Price</th>
                  <th className="px-4 py-2.5 text-right">24h Performance</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pricesLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">
                      Loading dashboard assets...
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">
                      No dashboard assets available.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr
                      key={asset.symbol}
                      onClick={() => router.push(`/dashboard/trade/${asset.symbol}`)}
                      className="group cursor-pointer hover:bg-white/[0.01] transition-all"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {asset.logo ? (
                            <img src={asset.logo} alt={asset.symbol} className="w-7 h-7 rounded-lg object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-white/5 grid place-items-center text-[10px] font-bold text-muted-foreground">{asset.symbol.slice(0, 2)}</div>
                          )}
                          <div>
                            <p className="font-bold text-sm leading-none mb-0.5">{asset.symbol}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">{asset.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-base font-bold tracking-tighter">
                        ${(asset.current_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${(asset.price_change_24h ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                        <div className={`flex items-center justify-end gap-1 text-[11px] ${(asset.price_change_24h ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                          <div className={`p-0.5 rounded-md ${(asset.price_change_24h ?? 0) >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
                            {(asset.price_change_24h ?? 0) >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          </div>
                          {Math.abs(asset.price_change_24h ?? 0).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => router.push(`/dashboard/trade/${asset.symbol}`)}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 hover:bg-primary/20 px-2.5 py-0.5 text-[10px] text-muted-foreground hover:text-primary transition-colors"
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
      </motion.div>
    </motion.div>
  );
}
