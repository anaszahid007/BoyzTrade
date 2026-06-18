"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, CheckCircle, Gift } from "lucide-react";
import type { Quest } from "@/services/gamification";
import { gamificationService } from "@/services/gamification";

interface DailyChallengesProps {
  quests: Quest[];
  claimQuest: (id: string) => void;
  onClaimAll?: () => void;
}

function getTimeToMidnight(): { hours: string; minutes: string; seconds: string } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return {
    hours: String(h).padStart(2, "0"),
    minutes: String(m).padStart(2, "0"),
    seconds: String(s).padStart(2, "0"),
  };
}

export default function DailyChallenges({ quests, claimQuest, onClaimAll }: DailyChallengesProps) {
  const [timer, setTimer] = useState(getTimeToMidnight);

  useEffect(() => {
    const interval = setInterval(() => setTimer(getTimeToMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dailyQuests = quests.filter(q => q.type === "daily");

  const allCompleted = dailyQuests.length > 0 && dailyQuests.every(q => q.completed);
  const anyUnclaimed = dailyQuests.some(q => q.completed && !q.claimed);

  const handleClaimAll = useCallback(async () => {
    const unclaimed = dailyQuests.filter(q => q.completed && !q.claimed);
    for (const q of unclaimed) {
      await claimQuest(q._id);
    }
    onClaimAll?.();
  }, [dailyQuests, claimQuest, onClaimAll]);

  if (dailyQuests.length === 0) return null;

  return (
    <div className="glass rounded-xl border border-white/5 p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <h3 className="text-xs font-bold tracking-tight">Today&apos;s Challenges</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
          <Clock className="w-2.5 h-2.5" />
          <span>{timer.hours}:{timer.minutes}:{timer.seconds}</span>
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="space-y-2">
        {dailyQuests.map((quest, idx) => (
          <motion.div
            key={quest._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`
              flex items-center gap-2.5 p-2.5 rounded-lg border transition-all duration-300
              ${quest.completed
                ? "bg-success/5 border-success/20"
                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"}
            `}
          >
            {/* Icon */}
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border
              ${quest.completed
                ? "bg-success/15 border-success/30"
                : "bg-white/5 border-white/10"}
            `}>
              {quest.completed ? "✅" : quest.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold leading-tight truncate">{quest.name}</p>
                <span className="text-[8px] text-muted-foreground/50 font-mono">
                  {quest.progress}/{quest.requirement?.value ?? 0}
                </span>
              </div>
              <p className="text-[8px] text-muted-foreground truncate">{quest.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      quest.completed ? 'bg-success' : 'bg-primary'
                    }`}
                    style={{ width: `${quest.requirement ? Math.min(100, (quest.progress / quest.requirement.value) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-[7px] text-muted-foreground/40">+{quest.xpReward} XP</span>
              </div>
            </div>

            {/* Status */}
            <div className="shrink-0">
              {quest.completed && !quest.claimed && (
                <button
                  onClick={() => claimQuest(quest._id)}
                  className="flex items-center gap-1 text-[8px] font-bold px-2 py-1 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors border border-success/20"
                >
                  <Gift className="w-2.5 h-2.5" />
                  Claim
                </button>
              )}
              {quest.claimed && (
                <div className="flex items-center gap-1 text-[8px] text-muted-foreground/40">
                  <CheckCircle className="w-2.5 h-2.5 text-success" />
                  <span>Done</span>
                </div>
              )}
              {!quest.completed && (
                <div className="text-[8px] text-muted-foreground/30 font-mono">
                  {Math.round((quest.progress / (quest.requirement?.value ?? 1)) * 100)}%
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Claim All */}
      {allCompleted && anyUnclaimed && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleClaimAll}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-[9px] font-bold py-2 rounded-lg bg-gradient-to-r from-success/20 to-primary/20 text-success hover:from-success/30 hover:to-primary/30 transition-all border border-success/20"
        >
          <Gift className="w-3 h-3" />
          Claim All Rewards
        </motion.button>
      )}

      {allCompleted && !anyUnclaimed && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-success/60 py-1">
          <CheckCircle className="w-3 h-3" />
          All challenges completed today!
        </div>
      )}
    </div>
  );
}
