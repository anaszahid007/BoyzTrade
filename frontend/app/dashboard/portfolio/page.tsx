"use client";

import React from "react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ArrowUpRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePortfolio } from "@/hooks/usePortfolio";
import Link from "next/link";

export default function PortfolioPage() {
  const { portfolio, loading, error } = usePortfolio();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-danger/10 text-danger rounded-2xl border border-danger/20">
          {error || "Failed to load portfolio"}
        </div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Map the backend data structure to what the UI expects
  const uiPortfolio = {
    balance: portfolio.cash_balance,
    totalValue: portfolio.total_portfolio_value,
    overallPnL: portfolio.total_profit_loss,
    overallPnLPercent: Number(portfolio.total_profit_loss_percentage),
    holdings: portfolio.holdings.map((holding) => ({
      symbol: holding.symbol,
      quantity: holding.quantity,
      avgBuyPrice: holding.avg_buy_price,
      currentPrice: holding.current_price,
      pnl: holding.profit_loss,
      pnlPercent: Number(holding.profit_loss_percentage),
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-0.5">Your <span className="gradient-text">Portfolio</span></h1>
        <p className="text-xs text-muted-foreground">Detailed overview of your virtual holdings and performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Stats Card */}
        <div className="lg:col-span-2 glass p-6 rounded-[1.5rem] border border-white/5 relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />
           
           <div className="space-y-0.5 relative z-10">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Net Worth</p>
             <h2 className="text-4xl font-bold tracking-tighter">${uiPortfolio.totalValue.toLocaleString()}</h2>
           </div>

           <div className="grid grid-cols-2 gap-3 mt-8 relative z-10">
             <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] text-muted-foreground mb-0.5 uppercase font-bold">Cash Balance</p>
                <p className="text-lg font-bold">${uiPortfolio.balance.toLocaleString()}</p>
             </div>
             <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] text-muted-foreground mb-0.5 uppercase font-bold">Total P&L</p>
                <p className={`text-lg font-bold ${uiPortfolio.overallPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                  {uiPortfolio.overallPnL >= 0 ? '+' : ''}${Math.abs(uiPortfolio.overallPnL).toLocaleString()}
                </p>
             </div>
           </div>
        </div>

        {/* Breakdown Summary */}
        <div className="glass p-6 rounded-[1.5rem] border border-white/5 space-y-4">
           <h3 className="text-sm font-bold flex items-center gap-2">
             <PieChart className="w-4 h-4 text-primary" />
             Asset Allocation
           </h3>
           <div className="space-y-3">
             {uiPortfolio.holdings.map((h: any) => (
               <div key={h.symbol} className="space-y-1">
                 <div className="flex justify-between text-[11px]">
                   <span className="font-bold">{h.symbol}</span>
                   <span className="text-muted-foreground">{((h.quantity * h.currentPrice / uiPortfolio.totalValue) * 100).toFixed(1)}%</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-primary neon-glow-blue" 
                    style={{ width: `${(h.quantity * h.currentPrice / uiPortfolio.totalValue) * 100}%` }}
                   />
                 </div>
               </div>
             ))}
           </div>
           <div className="pt-3 border-t border-white/5 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
              <p className="text-[9px] text-muted-foreground font-medium italic">Portfolio rebalances automatically based on live prices.</p>
           </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold px-1">Individual Holdings</h3>
        <div className="glass rounded-[1.5rem] border border-white/5 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-muted-foreground text-[9px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                  <th className="px-6 py-4 text-right">Avg Price</th>
                  <th className="px-6 py-4 text-right">Current Price</th>
                  <th className="px-6 py-4 text-right">P&L (%)</th>
                  <th className="px-6 py-4 text-center">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {uiPortfolio.holdings.map((h: any) => (
                  <tr key={h.symbol} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4 font-bold text-base">{h.symbol}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm">{h.quantity}</td>
                    <td className="px-6 py-4 text-right text-xs text-muted-foreground tracking-tighter">${h.avgBuyPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-bold">${h.currentPrice.toLocaleString()}</td>
                    <td className={`px-6 py-4 text-right font-bold text-xs ${h.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {h.pnl >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {h.pnlPercent}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/dashboard/trade?asset=${h.symbol}`}>
                        <Button variant="ghost" className="p-1.5 h-auto rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                           <ArrowUpRight className="w-4 h-4" />
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