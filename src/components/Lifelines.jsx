import React from "react";
import { Users, PhoneCall, RefreshCw, Slash } from "lucide-react";
import { sounds } from "../utils/soundEffects";

export const LIFELINE_TYPES = {
  FIFTY_FIFTY: "fiftyFifty",
  AUDIENCE_POLL: "audiencePoll",
  PHONE_FRIEND: "phoneFriend",
  FLIP_QUESTION: "flipQuestion",
};

export default function Lifelines({ 
  usedLifelines, 
  onUseLifeline, 
  disabled = false,
  currentQuestionIndex = 0
}) {
  const isLastQuestion = currentQuestionIndex === 16; // Q17 (0-indexed)
  const lifelinesDisabled = isLastQuestion || disabled;

  const lifelinesList = [
    {
      id: LIFELINE_TYPES.FIFTY_FIFTY,
      name: "50:50",
      description: "Eliminates 2 wrong answers",
      icon: (
        <span className="font-bold font-rajdhani text-sm tracking-tighter">
          50:50
        </span>
      ),
    },
    {
      id: LIFELINE_TYPES.AUDIENCE_POLL,
      name: "Audience Poll",
      description: "Ask the studio audience",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: LIFELINE_TYPES.PHONE_FRIEND,
      name: "Phone a Friend",
      description: "Call a friend for 30s",
      icon: <PhoneCall className="w-4 h-4" />,
    },
    {
      id: LIFELINE_TYPES.FLIP_QUESTION,
      name: "Flip Question",
      description: "Change current question",
      icon: <RefreshCw className="w-4 h-4" />,
    },
  ];

  const handleLifelineClick = (id) => {
    if (lifelinesDisabled || usedLifelines[id]) return;
    sounds.playLifeline();
    onUseLifeline(id);
  };

  return (
    <div id="kbc-lifelines" className="flex items-center gap-3">
      {lifelinesList.map((item) => {
        const isUsed = usedLifelines[item.id];
        return (
          <div key={item.id} className="relative group">
            <button
              id={`lifeline-btn-${item.id}`}
              type="button"
              disabled={lifelinesDisabled || isUsed}
              onClick={() => handleLifelineClick(item.id)}
              title={
                isLastQuestion
                  ? "Lifelines not allowed on ₹7 Crore question"
                  : isUsed
                  ? `${item.name} (Already Used)`
                  : item.description
              }
              className={`relative flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-2 transition-all duration-300 shadow-md ${
                isLastQuestion
                  ? "bg-slate-900/60 border-slate-700 text-slate-600 cursor-not-allowed opacity-50 grayscale"
                  : isUsed
                  ? "bg-slate-900/60 border-slate-700 text-slate-600 cursor-not-allowed opacity-40 scale-95"
                  : disabled
                  ? "bg-slate-900/80 border-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-b from-blue-900 via-slate-900 to-indigo-950 border-amber-400/80 text-amber-300 hover:border-amber-300 hover:scale-105 hover:shadow-amber-500/30 active:scale-95 cursor-pointer ring-1 ring-amber-500/40"
              }`}
            >
              {/* Visual Icon */}
              <div className="flex items-center justify-center">
                {item.icon}
              </div>

              {/* Red diagonal strike when used */}
              {isUsed && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Slash className="w-10 h-10 text-red-500/80 stroke-[2.5]" />
                </div>
              )}

              {/* Mini Label */}
              <span className="absolute -bottom-5 text-[9px] font-semibold whitespace-nowrap text-slate-400 group-hover:text-amber-300 transition-colors">
                {item.name}
              </span>
            </button>

            {/* Hover Tooltip specifically for Question 17 restriction */}
            {isLastQuestion && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center bg-slate-950 text-amber-300 text-[10px] font-semibold px-2.5 py-1 rounded-md border border-amber-400/50 shadow-xl pointer-events-none whitespace-nowrap z-30">
                Lifelines not allowed on ₹7 Crore question
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
