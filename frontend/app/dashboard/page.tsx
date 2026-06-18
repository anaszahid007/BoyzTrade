"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePrices } from "@/hooks/usePrices";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useGamification } from "@/hooks/useGamification";
import { useBadges } from "@/hooks/useBadges";
import { useQuests } from "@/hooks/useQuests";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  PlusCircle,
  RefreshCcw,
  LayoutDashboard,
  ArrowRight,
  Zap,
  Trophy,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import StreakCard from "@/components/dashboard/StreakCard";
import DailyChallenges from "@/components/dashboard/DailyChallenges";
import CareerPath from "@/components/dashboard/CareerPath";

function SkeletonCard() {
  return (
    <div className="glass p-4 rounded-xl border border-white/5 space-y-3 relative overflow-hidden">
      <div className="space-y-2">
        <div className="h-2.5 w-24 bg-white/5 rounded animate-pulse" />
        <div className="h-7 w-36 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="h-4 w-16 bg-white/5 rounded-full animate-pulse" />
    </div>
  );
}

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
  const { profile: gamification } = useGamification();
  const { badges } = useBadges();
  const { quests, claimQuest } = useQuests();

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
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
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
          </>
        )}
      </motion.div>

      {/* Gamification Card */}
      {gamification && (
        <motion.div variants={item}>
          <div className="glass rounded-xl border border-white/5 p-4 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Level Badge */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <span className="text-lg font-black text-primary">{gamification.level}</span>
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">{gamification.levelTitle}</p>
                  <p className="text-[9px] text-muted-foreground/60">Level {gamification.level}</p>
                </div>
              </div>

              {/* XP Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-warning" />
                    {gamification.xp.toLocaleString()} / {gamification.xpForNext.toLocaleString()} XP
                  </span>
                  <span className="text-[9px] text-muted-foreground/50">
                    {gamification.xpForNext > gamification.xpForCurrent
                      ? Math.round(((gamification.xp - gamification.xpForCurrent) / (gamification.xpForNext - gamification.xpForCurrent)) * 100)
                      : 100}%
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                    style={{
                      width: `${gamification.xpForNext > gamification.xpForCurrent
                        ? Math.min(100, ((gamification.xp - gamification.xpForCurrent) / (gamification.xpForNext - gamification.xpForCurrent)) * 100)
                        : 100}%`
                    }}
                  />
                </div>
                {gamification.xpForNext > gamification.xp && (
                  <p className="text-[8px] text-muted-foreground/40 mt-1">
                    {(gamification.xpForNext - gamification.xp).toLocaleString()} XP to next level
                  </p>
                )}
              </div>

              {/* Mini Stats */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-success justify-center">
                    <BarChart3 className="w-3 h-3" />
                    <span className="text-xs font-bold">{gamification.totalTrades}</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground/50">Trades</p>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="text-center">
                  <div className="flex items-center gap-1 text-primary justify-center">
                    <Trophy className="w-3 h-3" />
                    <span className="text-xs font-bold">{gamification.profitableTrades}</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground/50">Profitable</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Streak + Daily Challenges Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {gamification && (
          <StreakCard
            currentStreak={gamification.currentStreak}
            longestStreak={gamification.longestStreak}
            streakMilestones={gamification.streakMilestones}
          />
        )}
        <DailyChallenges
          quests={quests}
          claimQuest={claimQuest}
        />
      </motion.div>

      {/* Career Path Row */}
      {gamification?.careerPath && (
        <motion.div variants={item}>
          <CareerPath careerPath={gamification.careerPath} />
        </motion.div>
      )}

      {/* Badges & Quests Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Badges */}
        <div className="glass rounded-xl border border-white/5 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Trophy className="w-3.5 h-3.5 text-warning" />
            <h3 className="text-xs font-bold tracking-tight">Badges</h3>
          </div>
          {badges.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">No badges available yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 8).map((badge) => (
                <div
                  key={badge._id}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all ${
                    badge.earned
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-white/5 border-white/10 text-muted-foreground/40'
                  }`}
                  title={badge.description}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                  {badge.earned && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quests */}
        <div className="glass rounded-xl border border-white/5 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-xs font-bold tracking-tight">Active Quests</h3>
          </div>
          {quests.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">No active quests.</p>
          ) : (
            <div className="space-y-2">
              {quests.filter(q => q.type !== 'daily').slice(0, 4).map((quest) => (
                <div key={quest._id} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-lg">{quest.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold leading-tight truncate">{quest.name}</p>
                      <span className="text-[8px] text-muted-foreground/50 uppercase tracking-wider">{quest.type}</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground truncate">{quest.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            quest.completed ? 'bg-success' : 'bg-primary'
                          }`}
                          style={{ width: `${quest.requirement ? Math.min(100, (quest.progress / quest.requirement.value) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-[7px] font-mono text-muted-foreground/60">
                        {quest.progress}/{quest.requirement?.value ?? 0}
                      </span>
                      {quest.completed && !quest.claimed && (
                        <button
                          onClick={() => claimQuest(quest._id)}
                          className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-success/20 text-success hover:bg-success/30 transition-colors"
                        >
                          Claim
                        </button>
                      )}
                      {quest.claimed && (
                        <span className="text-[7px] text-muted-foreground/40">Claimed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
