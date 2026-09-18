import React from "react";
import { PRIZE_LADDER } from "../utils/prizeCalculator";
import { Award, ChevronRight, CheckCircle2, ShieldCheck, Flame } from "lucide-react";

export default function PrizeLadder({ currentQuestionIndex, currentEarnings }) {
  // Ladder is traditionally displayed with Q17 at top and Q1 at bottom
  const reversedLadder = [...PRIZE_LADDER].reverse();

  return (
    <div id="kbc-prize-ladder" className="flex flex-col bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3 shadow-2xl shadow-blue-950/80 backdrop-blur-md h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-cinzel">
            Dhanrashi Ladder
          </span>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          Won: {currentEarnings.formatted}
        </span>
      </div>

      {/* 17 Levels List */}
      <div className="flex flex-col gap-1 overflow-y-auto pr-1 flex-1 text-xs">
        {reversedLadder.map((tier) => {
          // questionIndex is 0-based, tier.level is 1-based
          const isCurrent = tier.level - 1 === currentQuestionIndex;
          const isCompleted = tier.level - 1 < currentQuestionIndex;
          const isMilestone = tier.isMilestone;
          const isJackpot = tier.isJackpot;

          let rowBg = "text-slate-400 hover:bg-slate-800/40";
          let borderStyle = "border-transparent";

          if (isCurrent) {
            rowBg = "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/30";
            borderStyle = "border-amber-300";
          } else if (isCompleted) {
            rowBg = "bg-emerald-950/40 text-emerald-300";
            borderStyle = "border-emerald-500/20";
          } else if (isMilestone) {
            rowBg = "bg-blue-950/40 text-amber-300 font-semibold";
            borderStyle = "border-amber-500/40";
          }

          return (
            <div
              key={tier.level}
              id={`ladder-level-${tier.level}`}
              className={`flex items-center justify-between px-2.5 py-1 rounded-lg border transition-all duration-200 ${rowBg} ${borderStyle}`}
            >
              <div className="flex items-center gap-2">
                {/* Level indicator / pointer */}
                {isCurrent ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-950 animate-ping" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isMilestone ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <span className="w-3.5 text-center text-[10px] text-slate-500 font-mono">
                    {tier.level}
                  </span>
                )}

                <span className={`font-mono text-xs ${isCurrent ? "font-bold text-slate-950" : isMilestone ? "font-bold text-amber-200" : ""}`}>
                  Q{tier.level}
                </span>

                {isJackpot && (
                  <span className="flex items-center text-[9px] uppercase px-1 py-0.2 bg-red-600 text-white rounded font-bold">
                    <Flame className="w-2.5 h-2.5 mr-0.5" /> Jackpot
                  </span>
                )}
                {isMilestone && !isJackpot && (
                  <span className="text-[9px] uppercase px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-medium">
                    Padav {tier.milestoneNumber}
                  </span>
                )}
              </div>

              {/* Amount */}
              <span className={`font-rajdhani text-sm tracking-wide ${isCurrent ? "text-slate-950 font-bold" : isMilestone ? "text-amber-300 font-bold" : "text-slate-200"}`}>
                {tier.formatted}
              </span>
            </div>
          );
        })}
      </div>

      {/* Milestone Legend */}
      <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-amber-400" /> Guaranteed Padav (Safe)
        </span>
        <span className="text-amber-400 font-semibold font-rajdhani">
          Total 17 Questions
        </span>
      </div>
    </div>
  );
}
