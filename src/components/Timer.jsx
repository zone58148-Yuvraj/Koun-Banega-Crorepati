import React, { useEffect, useState, useRef } from "react";
import { Clock } from "lucide-react";
import { sounds } from "../utils/soundEffects";

export default function Timer({ 
  initialTime = 45, 
  isActive = true, 
  isPaused = false, 
  onTimeUp, 
  questionIndex = 0 
}) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const onTimeUpRef = useRef(onTimeUp);
  const hasFiredTimeUpRef = useRef(false);

  const isUnlimited = questionIndex >= 10; // Q11 to Q17: No timer

  // Keep latest onTimeUp callback in ref without re-triggering timer intervals
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Reset timer when questionIndex changes
  useEffect(() => {
    hasFiredTimeUpRef.current = false;
    if (questionIndex >= 10) {
      setTimeLeft(Infinity);
      return;
    }
    // For questions 1-5 (indices 0-4): 45 seconds
    // For questions 6-10 (indices 5-9): 60 seconds
    const duration = questionIndex >= 5 ? 60 : 45;
    setTimeLeft(duration);
  }, [questionIndex]);

  // Tick interval - purely updates timeLeft, never invokes callbacks in setState
  useEffect(() => {
    if (!isActive || isPaused || isUnlimited) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (typeof prev !== "number" || !isFinite(prev)) return prev;
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, isUnlimited]);

  // Ticking audio cue for the last 10 seconds
  useEffect(() => {
    if (!isActive || isPaused || isUnlimited) return;
    if (timeLeft <= 10 && timeLeft > 0) {
      sounds.playTick();
    }
  }, [timeLeft, isActive, isPaused, isUnlimited]);

  // Dedicated effect to safely trigger onTimeUp when reaching 0 (after DOM commit)
  useEffect(() => {
    if (!isActive || isPaused || isUnlimited) return;
    if (timeLeft === 0 && !hasFiredTimeUpRef.current) {
      hasFiredTimeUpRef.current = true;
      const timeoutId = setTimeout(() => {
        onTimeUpRef.current?.();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [timeLeft, isActive, isPaused, isUnlimited]);

  if (isUnlimited) {
    return (
      <div id="kbc-timer-container" className="flex items-center gap-3 bg-slate-900/90 border border-amber-500/40 px-4 py-2 rounded-xl shadow-lg shadow-blue-950/50 backdrop-blur-md">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 font-bold">
          ∞
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Samay (Timer)
          </span>
          <span className="text-xs font-semibold text-amber-300">
            No Time Limit
          </span>
        </div>
      </div>
    );
  }

  // Determine timer duration for progress calculation
  const totalDuration = questionIndex >= 5 ? 60 : 45;
  const percentage = (timeLeft / totalDuration) * 100;
  const isCritical = timeLeft <= 10;
  const isWarning = timeLeft <= 20 && !isCritical;

  return (
    <div id="kbc-timer-container" className="flex items-center gap-3 bg-slate-900/90 border border-blue-500/40 px-4 py-2 rounded-xl shadow-lg shadow-blue-950/50 backdrop-blur-md">
      <div className="relative flex items-center justify-center w-11 h-11">
        {/* Circular SVG progress */}
        <svg className="w-11 h-11 -rotate-90 transform" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="18"
            className="stroke-slate-800"
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r="18"
            className={`transition-all duration-1000 ease-linear ${
              isCritical
                ? "stroke-red-500"
                : isWarning
                ? "stroke-amber-400"
                : "stroke-emerald-400"
            }`}
            strokeWidth="3.5"
            strokeDasharray={113.1}
            strokeDashoffset={113.1 - (113.1 * percentage) / 100}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <span
          className={`absolute text-sm font-bold font-rajdhani ${
            isCritical
              ? "text-red-400 animate-pulse text-base"
              : isWarning
              ? "text-amber-300"
              : "text-emerald-300"
          }`}
        >
          {timeLeft}
        </span>
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" /> Samay (Timer)
        </span>
        <span className={`text-xs font-semibold ${isCritical ? "text-red-400 font-bold" : "text-slate-200"}`}>
          {isCritical ? "Time running out!" : `${timeLeft}s left`}
        </span>
      </div>
    </div>
  );
}
