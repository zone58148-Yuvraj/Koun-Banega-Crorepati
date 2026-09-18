import React, { useEffect, useState } from "react";
import { 
  Users, 
  PhoneCall, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  RotateCcw, 
  X,
  Volume2,
  Sparkles,
  FileCheck2,
  Loader2
} from "lucide-react";
import { formatPrizeAmount } from "../utils/prizeCalculator";

export default function Modal({
  isOpen,
  type, // "AUDIENCE_POLL" | "PHONE_FRIEND" | "CONFIRM_QUIT" | "GAME_OVER" | "RULES"
  data, // context data for the modal
  onClose,
  onConfirmQuit,
  onRestart,
  onViewCheque,
  isRestarting = false
}) {
  const [phoneTimer, setPhoneTimer] = useState(30);

  // Phone countdown simulation
  useEffect(() => {
    if (isOpen && type === "PHONE_FRIEND") {
      setPhoneTimer(30);
      const interval = setInterval(() => {
        setPhoneTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  return (
    <div 
      id="kbc-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div 
        id="kbc-modal-content"
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl shadow-blue-900/60 overflow-hidden"
      >
        {/* Decorative corner glows */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            {type === "AUDIENCE_POLL" && <Users className="w-5 h-5 text-amber-400" />}
            {type === "PHONE_FRIEND" && <PhoneCall className="w-5 h-5 text-amber-400 animate-pulse" />}
            {type === "CONFIRM_QUIT" && <AlertCircle className="w-5 h-5 text-amber-400" />}
            {type === "GAME_OVER" && <Award className="w-5 h-5 text-amber-400" />}
            <h3 className="text-lg font-bold font-cinzel text-amber-300">
              {type === "AUDIENCE_POLL" && "Janmat Sangrah (Audience Poll)"}
              {type === "PHONE_FRIEND" && "Mitra ko Phone (Phone a Friend)"}
              {type === "CONFIRM_QUIT" && "Khel Chhodna (Quit Game?)"}
              {type === "GAME_OVER" && (data?.isJackpot ? "Mubarak Ho! Crorepati!" : "Khel Samapt (Game Over)")}
              {type === "RULES" && "Niyam aur Jankari (Rules)"}
            </h3>
          </div>

          {type !== "GAME_OVER" && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* AUDIENCE POLL CONTENT */}
        {type === "AUDIENCE_POLL" && data && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-300">
              Studio audience has cast their votes on their voting keypads:
            </p>
            <div className="grid grid-cols-4 gap-3 py-3">
              {["A", "B", "C", "D"].map((optKey) => {
                const percent = data.pollResults?.[optKey] || 0;
                return (
                  <div key={optKey} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {percent}%
                    </span>
                    <div className="w-full bg-slate-800/80 rounded-t-lg h-36 flex items-end p-1 border border-slate-700">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-amber-400 rounded-t transition-all duration-1000"
                        style={{ height: `${percent}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center border border-amber-400/40 text-amber-300">
                      {optKey}
                    </span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              Khel Jari Rakhein (Continue)
            </button>
          </div>
        )}

        {/* PHONE A FRIEND CONTENT */}
        {type === "PHONE_FRIEND" && data && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-300 font-bold">
                  {data.friendName ? data.friendName[0] : "P"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {data.friendName || "Dr. Rajesh Sharma (Trivia Master)"}
                  </h4>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Call Connected ({phoneTimer}s left)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-950/40 border border-blue-500/30 p-4 rounded-xl text-sm leading-relaxed text-slate-200">
              <p className="italic text-amber-200">
                "{data.friendAdvice}"
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-blue-900/60 pt-2">
                <span>Friend Confidence:</span>
                <span className="text-amber-400 font-bold">{data.friendConfidence}%</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              Thank You Friend! (Continue)
            </button>
          </div>
        )}

        {/* CONFIRM QUIT CONTENT */}
        {type === "CONFIRM_QUIT" && data && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to quit? If you walk away now, you will securely take home:
            </p>
            <div className="bg-slate-800/60 border border-amber-500/40 p-4 rounded-xl text-center">
              <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                Current Guaranteed Winnings
              </span>
              <div className="text-3xl font-extrabold text-amber-300 font-rajdhani mt-1">
                {data.winnings?.formatted || "₹0"}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition border border-slate-700"
              >
                Nahin, Khelna Hai (Stay)
              </button>
              <button
                onClick={onConfirmQuit}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                Haan, Quit Karein (Walk Away)
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER CONTENT */}
        {type === "GAME_OVER" && data && (
          <div className="flex flex-col items-center gap-4 text-center">
            {data.isJackpot ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-2">
                  <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
                </div>
                <h4 className="text-2xl font-bold font-cinzel text-amber-400">
                  7 CRORE JACKPOT WINNER!
                </h4>
                <p className="text-sm text-slate-300 mt-1">
                  Incredible! You have conquered all 17 questions and become the ultimate Crorepati!
                </p>
              </div>
            ) : data.isWin ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-2" />
                <h4 className="text-xl font-bold font-cinzel text-emerald-300">
                  Congratulations!
                </h4>
                <p className="text-sm text-slate-300 mt-1">
                  You played brilliantly!
                </p>
              </div>
            ) : data.isQuit ? (
              <div className="flex flex-col items-center">
                <Award className="w-12 h-12 text-amber-400 mb-2" />
                <h4 className="text-xl font-bold font-cinzel text-amber-300">
                  Aapne Khel Chhoda (Walked Away)
                </h4>
                <p className="text-sm text-slate-300 mt-1">
                  A wise decision to secure your earnings!
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <AlertCircle className="w-12 h-12 text-red-400 mb-2" />
                <h4 className="text-xl font-bold font-cinzel text-red-300">
                  Afsos! Galat Jawab (Wrong Answer)
                </h4>
                {data.correctAnswer && (
                  <p className="text-xs text-slate-400 mt-1">
                    The correct answer was: <strong className="text-emerald-400">{data.correctAnswer}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Prize card */}
            <div className="w-full bg-slate-800/80 border border-amber-400/40 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                Antim Dhanrashi (Total Prize Won)
              </span>
              <div className="text-4xl font-extrabold text-amber-300 font-rajdhani mt-1">
                {formatPrizeAmount(data.finalPrizeAmount || 0)}
              </div>
              {data.milestoneReached && (
                <div className="mt-1 text-xs text-emerald-400">
                  Protected by Padav Guarantee
                </div>
              )}
            </div>

            {/* View Prize Cheque Action Button */}
            {(data.finalPrizeAmount > 0 || data.isWin || data.isJackpot) && (
              <button
                type="button"
                id="kbc-view-cheque-btn"
                onClick={onViewCheque}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black rounded-xl transition shadow-xl shadow-amber-500/30 transform hover:scale-102 active:scale-98 font-cinzel text-sm cursor-pointer border-2 border-yellow-100"
              >
                <FileCheck2 className="w-4 h-4 text-slate-950" />
                <span>Prize Cheque Dekhein (View Official Cheque)</span>
              </button>
            )}

            <button
              type="button"
              id="kbc-play-again-btn"
              onClick={onRestart}
              disabled={isRestarting}
              className={`w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition border font-cinzel text-sm shadow-lg ${
                isRestarting
                  ? "bg-slate-800/80 text-amber-300/80 border-slate-700 cursor-not-allowed opacity-90"
                  : "bg-slate-800 hover:bg-slate-700 active:scale-98 text-white hover:text-amber-300 border-slate-700 cursor-pointer"
              }`}
            >
              {isRestarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Naya Khel Khelein (Play Again)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* RULES CONTENT */}
        {type === "RULES" && (
          <div className="flex flex-col gap-3 text-xs text-slate-300">
            <div className="space-y-2">
              <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
                <strong className="text-amber-300 block mb-0.5">17 Sawaal (17 Questions)</strong>
                Prize money increases with each correct answer, from ₹1,000 to ₹7 Crore.
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
                <strong className="text-amber-300 block mb-0.5">3 Safe Padav (Milestones)</strong>
                Q5 (₹10,000), Q10 (₹3,20,000), and Q15 (₹75,00,000). Once crossed, you can never drop below that amount!
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
                <strong className="text-amber-300 block mb-0.5">4 Lifelines</strong>
                50:50, Audience Poll, Phone a Friend, and Flip Question. Each can be used once per game.
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
                <strong className="text-amber-300 block mb-0.5">Quit Option</strong>
                You can choose to walk away anytime before locking an answer to keep your current winnings.
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
            >
              Samajh Gaya (Understood)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
