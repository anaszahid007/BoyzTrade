"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, Trophy, DollarSign, CheckCircle, Lock, Zap, Flame } from "lucide-react";
import type { CareerPath as CareerPathType } from "@/services/gamification";

interface CareerPathProps {
  careerPath: CareerPathType;
}

function formatSalary(salary: number): string {
  if (salary >= 1000000) return `$${(salary / 1000000).toFixed(1)}M`;
  if (salary >= 1000) return `$${(salary / 1000).toFixed(0)}K`;
  return `$${salary}`;
}

export default function CareerPath({ careerPath }: CareerPathProps) {
  const { stages, currentStage, currentTitle, currentSalary } = careerPath;

  return (
    <div className="glass rounded-xl border border-white/5 p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-primary" />
          <h3 className="text-xs font-bold tracking-tight">Career Path</h3>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
          <DollarSign className="w-2.5 h-2.5 text-success" />
          <span className="font-bold text-success">{formatSalary(currentSalary)}/yr</span>
        </div>
      </div>

      {/* Current Title */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/20 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold leading-tight">{currentTitle}</p>
          <p className="text-[8px] text-muted-foreground/60">Stage {currentStage} of {stages.length - 1}</p>
        </div>
      </div>

      {/* Career Timeline */}
      <div className="space-y-0">
        {stages.map((stage, idx) => {
          const isCurrent = stage.current;
          const isUnlocked = stage.unlocked;
          const isNext = careerPath.nextStage?.stage === stage.stage;

          return (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="relative"
            >
              {/* Connector Line */}
              {idx < stages.length - 1 && (
                <div className={`absolute left-[15px] top-8 w-0.5 h-full -z-0 ${
                  isUnlocked ? 'bg-success/30' : 'bg-white/5'
                }`} />
              )}

              <div className={`relative flex items-start gap-3 pb-3 ${isCurrent ? 'z-10' : 'z-0'}`}>
                {/* Stage Indicator */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300
                  ${isCurrent
                    ? 'bg-primary/20 border-primary/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                    : isUnlocked
                    ? 'bg-success/15 border-success/30'
                    : 'bg-white/5 border-white/10'}
                `}>
                  {isCurrent ? (
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                  ) : isUnlocked ? (
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Lock className="w-3 h-3 text-muted-foreground/40" />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 pt-0.5 transition-all duration-300
                  ${isCurrent ? '' : isUnlocked ? 'opacity-60' : 'opacity-30'}
                `}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-[10px] font-bold leading-tight ${isCurrent ? 'text-foreground' : ''}`}>
                        {stage.title}
                      </p>
                      {isCurrent && (
                        <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                          Current
                        </span>
                      )}
                    </div>
                    <span className={`text-[8px] font-mono ${isUnlocked ? 'text-success' : 'text-muted-foreground/40'}`}>
                      {formatSalary(stage.salary)}
                    </span>
                  </div>

                  {/* Requirements */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-[7px] text-muted-foreground/50">
                      <TrendingUp className="w-2 h-2" />
                      <span>{stage.requirements.trades.toLocaleString()} trades</span>
                    </div>
                    <div className="flex items-center gap-1 text-[7px] text-muted-foreground/50">
                      <Zap className="w-2 h-2" />
                      <span>Lv {stage.requirements.level}</span>
                    </div>
                    {stage.requirements.streak && (
                      <div className="flex items-center gap-1 text-[7px] text-muted-foreground/50">
                        <Flame className="w-2 h-2" />
                        <span>{stage.requirements.streak}d streak</span>
                      </div>
                    )}
                  </div>

                  {/* Next Stage Progress Bars */}
                  {isNext && stage.progress && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${stage.progress.trades}%` }} />
                        </div>
                        <span className="text-[6px] font-mono text-muted-foreground/40 w-12 text-right">
                          trades {stage.progress.trades.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${stage.progress.level}%` }} />
                        </div>
                        <span className="text-[6px] font-mono text-muted-foreground/40 w-12 text-right">
                          lv {stage.progress.level.toFixed(0)}%
                        </span>
                      </div>
                      {stage.progress.streak < 100 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-amber-400" style={{ width: `${stage.progress.streak}%` }} />
                          </div>
                          <span className="text-[6px] font-mono text-muted-foreground/40 w-12 text-right">
                            streak {stage.progress.streak.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Salary Summary */}
      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[8px] text-muted-foreground/50">
        <div className="flex items-center gap-1">
          <Trophy className="w-2.5 h-2.5" />
          <span>Stage {currentStage} / {stages.length - 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-2.5 h-2.5 text-success" />
          <span className="text-success font-bold">{formatSalary(currentSalary)}</span>
          <span className="text-muted-foreground/40">virtual salary</span>
        </div>
      </div>
    </div>
  );
}
