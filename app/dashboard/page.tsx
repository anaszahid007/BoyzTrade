"use client";

import React from "react";
import { usePrices } from "@/hooks/usePrices";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  PlusCircle, 
  MinusCircle,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function DashboardPage() {
  const { prices, loading, error, refresh } = usePrices();

  // Mocking portfolio data for now (since we don't have getPortfolio yet)
  const portfolio = {
    balance: 10000.00,
    totalValue: 12450.75,
    pnl: 2450.75,
    pnlPercent: 24.5
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Trading <span className="gradient-text">Terminal</span></h1>
          <p className="text-muted-foreground">Monitor the market and manage your virtual portfolio.</p>
        </div>
        <Button variant="secondary" onClick={refresh} isLoading={loading} className="w-fit">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Prices
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border border-white/5 space-y-4 neon-glow-blue relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="w-24 h-24" />
           </div>
           <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Balance</p>
           <h2 className="text-4xl font-bold">${portfolio.balance.toLocaleString()}</h2>
           <div className="flex items-center gap-2 text-success text-sm font-medium">
              <PlusCircle className="w-4 h-4" />
              <span>Virtual Funds</span>
           </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden group">
           <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Portfolio Value</p>
           <h2 className="text-4xl font-bold">${portfolio.totalValue.toLocaleString()}</h2>
           <div className="flex items-center gap-2 text-success text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>Net Equity</span>
           </div>
        </div>

        <div className={`glass p-6 rounded-3xl border border-white/5 space-y-4 neon-glow-${portfolio.pnl >= 0 ? 'green' : 'red'} relative overflow-hidden group`}>
           <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Profit/Loss</p>
           <h2 className={`text-4xl font-bold ${portfolio.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
             {portfolio.pnl >= 0 ? '+' : ''}${Math.abs(portfolio.pnl).toLocaleString()}
           </h2>
           <div className={`flex items-center gap-2 text-sm font-medium ${portfolio.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
              {portfolio.pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{portfolio.pnlPercent}% Return</span>
           </div>
        </div>
      </div>

      {/* Market Prices Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold px-1">Market Overview</h3>
          <Link href="/trade" className="text-sm text-primary hover:underline font-medium">View All Assets</Link>
        </div>
        
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-muted-foreground text-xs uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">24h Change</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {prices.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs border border-border group-hover:border-primary/50 transition-colors">
                          {asset.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{asset.symbol}</p>
                          <p className="text-xs text-muted-foreground">Crypto Asset</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-lg font-medium">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-6 py-5 text-right font-medium ${asset.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {asset.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(asset.change24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Link href={`/trade?asset=${asset.symbol}`}>
                        <Button variant="primary" className="py-2 px-4 text-sm h-auto">
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
      </div>
    </div>
  );
}
