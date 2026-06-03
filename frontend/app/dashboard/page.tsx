"use client";

import React from "react";
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
  const { prices, loading: pricesLoading, refresh: refreshPrices } = usePrices();
  const { portfolio, loading: portfolioLoading, refresh: refreshPortfolio } = usePortfolio();

  const loading = pricesLoading || portfolioLoading;

  const refreshAll = () => {
    refreshPrices();
    refreshPortfolio();
  };

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
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Dashboard Overview</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Trading <span className="text-success">Terminal</span></h1>
          <p className="text-xs text-muted-foreground max-w-sm">Global crypto market analysis and virtual portfolio management.</p>
        </div>
        <Button variant="secondary" onClick={refreshAll} isLoading={loading} className="w-fit px-4 h-10 rounded-xl border-white/5 hover:border-primary/20 transition-all text-xs font-bold">
          <RefreshCcw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Sync Market Data
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-[1.5rem] border border-white/5 space-y-4 neon-glow-blue relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
              <DollarSign className="w-20 h-20" />
           </div>
           <div className="space-y-0.5 relative z-10">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Available Balance</p>
             <h2 className="text-3xl font-bold tracking-tighter">${stats.balance.toLocaleString()}</h2>
           </div>
           <div className="flex items-center gap-1.5 text-success text-[9px] font-bold bg-success/10 w-fit px-2 py-1 rounded-full border border-success/20">
              <PlusCircle className="w-3 h-3" />
              <span>VIRTUAL FUNDS</span>
           </div>
        </div>

        <div className="glass p-5 rounded-[1.5rem] border border-white/5 space-y-4 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ArrowUpRight className="w-20 h-20 text-primary" />
           </div>
           <div className="space-y-0.5 relative z-10">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Total Portfolio Value</p>
             <h2 className="text-3xl font-bold tracking-tighter">${stats.totalValue.toLocaleString()}</h2>
           </div>
           <div className="flex items-center gap-1.5 text-primary text-[9px] font-bold bg-primary/10 w-fit px-2 py-1 rounded-full border border-primary/20">
              <ArrowUpRight className="w-3 h-3" />
              <span>NET EQUITY</span>
           </div>
        </div>

        <div className={`glass p-5 rounded-[1.5rem] border border-white/5 space-y-4 neon-glow-${Number(stats.pnl) >= 0 ? 'green' : 'red'} relative overflow-hidden group hover:scale-[1.01] transition-all duration-500`}>
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              {Number(stats.pnl) >= 0 ? <TrendingUp className="w-20 h-20 text-success" /> : <TrendingDown className="w-20 h-20 text-danger" />}
           </div>
           <div className="space-y-0.5 relative z-10">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Overall Profit/Loss</p>
             <h2 className={`text-3xl font-bold tracking-tighter ${Number(stats.pnl) >= 0 ? 'text-success' : 'text-danger'}`}>
               {Number(stats.pnl) >= 0 ? '+' : ''}${Math.abs(Number(stats.pnl)).toLocaleString()}
             </h2>
           </div>
           <div className={`flex items-center gap-1.5 text-[9px] font-bold w-fit px-2 py-1 rounded-full border ${Number(stats.pnl) >= 0 ? 'text-success bg-success/10 border-success/20' : 'text-danger bg-danger/10 border-danger/20'}`}>
              {Number(stats.pnl) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{stats.pnlPercent}% RETURN</span>
           </div>
        </div>
      </motion.div>

      {/* Market Prices Table */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">Market Overview</h3>
          </div>
          <Link href="/dashboard/trade" className="group flex items-center gap-1.5 text-xs text-primary font-bold hover:underline">
            View All Assets
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="glass rounded-[1.5rem] border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-muted-foreground text-[9px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4 text-right">Live Price</th>
                  <th className="px-6 py-4 text-right">24h Performance</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {prices.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-white/[0.01] transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center font-bold text-xs border border-white/5 group-hover:border-primary/30 transition-all shadow-md group-hover:scale-105">
                          {asset.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-base leading-none mb-1">{asset.symbol}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Crypto Asset</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-lg font-bold tracking-tighter">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold`}>
                      <div className={`flex items-center justify-end gap-1 text-xs ${asset.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                        <div className={`p-0.5 rounded-md ${asset.change24h >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
                          {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        </div>
                        {Math.abs(asset.change24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/dashboard/trade?asset=${asset.symbol}`}>
                        <Button variant="primary" className="py-2 px-4 text-xs font-bold h-auto rounded-lg shadow-md shadow-primary/5 hover:shadow-primary/10 transition-all group-hover:scale-105">
                          Trade
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
