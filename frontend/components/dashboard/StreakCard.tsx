"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Zap } from "lucide-react";
import type { StreakMilestone } from "@/services/gamification";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  streakMilestones: StreakMilestone[];
}

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreakCard({ currentStreak, longestStreak, streakMilestones }: StreakCardProps) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (mondayOffset - i));
    const dayNum = date.getDate();
    const isToday = i === mondayOffset;
    const daysAgo = mondayOffset - i;
    const isActive = daysAgo === 0 ? true : currentStreak > daysAgo;
    return { dayNum, isToday, isActive, label: dayLabels[i] };
  });

  const flameSize = Math.min(48 + currentStreak * 2, 80);
  const flameOpacity = Math.min(0.5 + currentStreak * 0.05, 1);

  const nextMilestone = streakMilestones.find(m => !m.reached);
  const milestoneProgress = nextMilestone ? nextMilestone.progress : 100;

  return (
    <div className="glass rounded-xl border border-white/5 p-4 shadow-lg">
      <div className="flex items-start gap-4">
        {/* Flame + Count */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [flameOpacity, 1, flameOpacity] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame
                className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                style={{ width: flameSize * 0.55, height: flameSize * 0.55 }}
              />
            </motion.div>
          </div>
          <span className="text-2xl font-black tracking-tighter mt-1">{currentStreak}</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">Day Streak</span>
        </div>

        {/* Calendar + Milestones */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* 7-Day Calendar */}
          <div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">This Week</p>
            <div className="flex gap-1.5">
              {weekDays.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[7px] font-bold text-muted-foreground/50 uppercase">{day.label}</span>
                  <div
                    className={`
                      w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold border transition-all duration-300
                      ${day.isToday && day.isActive
                        ? "bg-amber-400/20 border-amber-400/40 text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.2)]"
                        : day.isActive
                        ? "bg-success/15 border-success/30 text-success"
                        : "bg-white/5 border-white/10 text-muted-foreground/40"}
                    `}
                  >
                    {day.isActive ? "✓" : day.dayNum}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Progress */}
          {nextMilestone && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-bold text-muted-foreground flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  Next: {nextMilestone.label}
                </span>
                <span className="text-[8px] text-muted-foreground/50">{currentStreak}/{nextMilestone.days} days</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
              <p className="text-[7px] text-muted-foreground/40 mt-1">
                +{nextMilestone.xp} XP at {nextMilestone.days} days
              </p>
            </div>
          )}

          {/* All Milestones */}
          <div className="flex items-center gap-3 pt-1">
            {streakMilestones.map((m) => (
              <div key={m.days} className={`flex items-center gap-1 text-[9px] font-bold ${m.reached ? 'text-success' : 'text-muted-foreground/40'}`}>
                <Trophy className="w-2.5 h-2.5" />
                <span>{m.days}d</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1 text-[8px] text-muted-foreground/50">
              <Trophy className="w-2.5 h-2.5" />
              <span>Best: {longestStreak}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
