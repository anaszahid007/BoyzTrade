"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, BarChart3, Medal, Zap, TrendingUp, Crown, Search, RefreshCcw } from "lucide-react";
import { gamificationService } from "@/services/gamification";
import { useAuth } from "@/contexts/AuthContext";

type SortType = "xp" | "streak" | "trades";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  email: string;
  xp: number;
  level: number;
  levelTitle: string;
  currentStreak: number;
  totalTrades: number;
}

const SORT_TABS: { type: SortType; label: string; icon: React.ReactNode }[] = [
  { type: "xp", label: "XP Ranking", icon: <Zap className="w-3 h-3" /> },
  { type: "streak", label: "Streak", icon: <Flame className="w-3 h-3" /> },
  { type: "trades", label: "Trades", icon: <BarChart3 className="w-3 h-3" /> },
];

const RANK_COLORS: Record<number, string> = {
  1: "text-amber-400",
  2: "text-slate-300",
  3: "text-amber-700",
};

const RANK_BG: Record<number, string> = {
  1: "bg-amber-400/10 border-amber-400/30",
  2: "bg-slate-300/10 border-slate-300/30",
  3: "bg-amber-700/10 border-amber-700/30",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [sortType, setSortType] = useState<SortType>("xp");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async (type: SortType) => {
    setLoading(true);
    try {
      const data = await gamificationService.getLeaderboard(type, 50);
      setEntries(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(sortType);
  }, [sortType, fetchLeaderboard]);

  const currentUserEntry = entries.find(e => e.userId === user?._id);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-4"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Trophy className="w-3.5 h-3.5 text-warning" />
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Gamification</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Leader<span className="text-success">Board</span></h1>
          <p className="text-[11px] text-muted-foreground max-w-sm">Top traders ranked by performance metrics.</p>
        </div>
        <button
          onClick={() => fetchLeaderboard(sortType)}
          className="flex items-center gap-1.5 text-[10px] font-bold px-3 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all w-fit"
        >
          <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Sort Tabs */}
      <motion.div variants={item} className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
        {SORT_TABS.map(tab => (
          <button
            key={tab.type}
            onClick={() => setSortType(tab.type)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all
              ${sortType === tab.type
                ? 'bg-primary text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Current User Card */}
      {currentUserEntry && (
        <motion.div variants={item} className="glass rounded-xl border border-primary/20 p-3 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-black text-sm">
              {currentUserEntry.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold truncate">{currentUserEntry.fullName || currentUserEntry.email}</p>
                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">You</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[8px] text-muted-foreground/60">
                <span>Lv.{currentUserEntry.level} {currentUserEntry.levelTitle}</span>
                <span>•</span>
                <span>{currentUserEntry.xp.toLocaleString()} XP</span>
                <span>•</span>
                <span>{currentUserEntry.totalTrades} trades</span>
                <span>•</span>
                <span>{currentUserEntry.currentStreak}d streak</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard Table */}
      <motion.div variants={item} className="glass rounded-xl border border-white/5 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/5 animate-pulse" />
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse" />
                  <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-3 w-10 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/5 rounded animate-pulse hidden md:block" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">No entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-muted-foreground text-[8px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-3 py-2.5 w-10">Rank</th>
                  <th className="px-3 py-2.5">Trader</th>
                  <th className="px-3 py-2.5 text-right">Level</th>
                  {sortType === "xp" && <th className="px-3 py-2.5 text-right">XP</th>}
                  {sortType === "streak" && <th className="px-3 py-2.5 text-right">Streak</th>}
                  {sortType === "trades" && <th className="px-3 py-2.5 text-right">Trades</th>}
                  <th className="px-3 py-2.5 text-right hidden md:table-cell">Title</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {entries.map((entry) => {
                  const isMe = entry.userId === user?._id;
                  const rankColor = RANK_COLORS[entry.rank];
                  const rankBg = RANK_BG[entry.rank];

                  return (
                    <tr
                      key={entry.userId}
                      className={`
                        group transition-all
                        ${isMe ? 'bg-primary/5' : 'hover:bg-white/[0.01]'}
                      `}
                    >
                      <td className="px-3 py-2.5">
                        <div className={`
                          flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-black
                          ${rankBg ? rankBg : 'bg-white/5 text-muted-foreground'}
                          ${rankColor ? rankColor : ''}
                          ${isMe ? 'ring-1 ring-primary/30' : ''}
                        `}>
                          {entry.rank <= 3 ? (
                            entry.rank === 1 ? <Crown className="w-3.5 h-3.5 text-amber-400" />
                              : <Medal className={`w-3 h-3 ${entry.rank === 2 ? 'text-slate-300' : 'text-amber-700'}`} />
                          ) : (
                            entry.rank
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-[8px] font-bold border border-white/10">
                            {(entry.fullName || entry.email).charAt(0).toUpperCase()}
                          </div>
                          <span className={`text-[10px] font-bold truncate max-w-[120px] ${isMe ? 'text-primary' : ''}`}>
                            {entry.fullName || entry.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-[10px] font-bold">
                        {entry.level}
                      </td>
                      {sortType === "xp" && (
                        <td className="px-3 py-2.5 text-right font-mono text-[10px] font-bold">
                          <span className="text-primary">{entry.xp.toLocaleString()}</span>
                        </td>
                      )}
                      {sortType === "streak" && (
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-amber-400">
                            <Flame className="w-2.5 h-2.5" />
                            {entry.currentStreak}
                          </div>
                        </td>
                      )}
                      {sortType === "trades" && (
                        <td className="px-3 py-2.5 text-right font-mono text-[10px] font-bold">
                          <span className="text-success">{entry.totalTrades.toLocaleString()}</span>
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-right text-[9px] text-muted-foreground hidden md:table-cell">
                        {entry.levelTitle}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
