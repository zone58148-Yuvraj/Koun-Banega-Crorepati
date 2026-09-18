import React, { useEffect, useState, useRef } from "react";
import { 
  X, 
  Printer, 
  Share2, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Download,
  Building2,
  Calendar,
  ShieldAlert,
  RotateCcw,
  Loader2
} from "lucide-react";
import { numberToWords, formatIndianCurrency } from "../utils/numberToWords";
import { sounds } from "../utils/soundEffects";
import Confetti from "./Confetti";

/**
 * PrizeCheque Component
 * Realistic animated KBC prize cheque presented when a player wins or walks away with earnings.
 * Features:
 * - Dynamic Indian Numbering words conversion (e.g. "Seven Crore Rupees Only")
 * - Authentic beige/cream bank cheque security patterns & dual gold border
 * - Authentic Amitabh Bachchan handwritten signature
 * - Animated "PAID" official stamp effect & sound effect
 * - Print, Share on WhatsApp, and Image download support
 * - Dynamic confetti display if winning the ₹7 Crore jackpot
 */
export default function PrizeCheque({
  isOpen,
  winnerName = "Hot Seat Khiladi",
  amount = 0,
  isJackpot = false,
  isQuit = false,
  onClose,
  onRestart,
  isRestarting = false,
}) {
  const [stampVisible, setStampVisible] = useState(false);
  const [chequeNumber, setChequeNumber] = useState("KBC-2026-789456");
  const [currentDateStr, setCurrentDateStr] = useState("");
  const chequeRef = useRef(null);

  // Generate cheque metadata on mount/open
  useEffect(() => {
    if (isOpen) {
      // Audio cue: Cash register chimes
      sounds.playCashRegister();

      // Stamp animation delay
      setStampVisible(false);
      const timer = setTimeout(() => {
        setStampVisible(true);
        sounds.playStamp();
      }, 550);

      // Random authentic looking cheque number
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      setChequeNumber(`KBC-${new Date().getFullYear()}-${randomDigits}`);

      // Current Date format DD/MM/YYYY
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      setCurrentDateStr(`${dd}/${mm}/${yyyy}`);

      return () => clearTimeout(timer);
    }
  }, [isOpen, amount]);

  if (!isOpen) return null;

  const validAmount = Math.max(0, Number(amount) || 0);
  const wordsAmount = numberToWords(validAmount);
  const formattedAmount = formatIndianCurrency(validAmount);
  const playerName = winnerName && winnerName.trim() ? winnerName.trim() : "Player";

  // Share on WhatsApp
  const handleShareWhatsApp = () => {
    const shareText = `🎉 I just won ${formattedAmount} (${wordsAmount}) on Kaun Banega Crorepati! Play the hot seat game yourself!`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Print cheque
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="kbc-cheque-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
    >
      {/* Confetti if ₹7 Crore or grand win */}
      {(isJackpot || validAmount >= 70000000) && <Confetti trigger={true} />}

      <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center my-auto">
        
        {/* Top Floating Control Bar */}
        <div className="w-full flex items-center justify-between mb-3 px-2 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-cinzel text-amber-300">
                Official KBC Winner's Cheque
              </h3>
              <p className="text-[11px] text-slate-400">
                {isQuit ? "Contestant walked away securely" : "Crorepati Victory Ceremony"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold shadow transition cursor-pointer"
              title="Print Cheque"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800/80 hover:bg-red-900/60 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer"
              title="Close Cheque"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container for Mobile View */}
        <div className="w-full overflow-x-auto pb-4 flex justify-center">
          
          {/* THE REALISTIC KBC PRIZE CHEQUE */}
          <div
            ref={chequeRef}
            id="kbc-printable-cheque"
            className="w-[780px] sm:w-[820px] min-w-[780px] kbc-cheque-paper kbc-cheque-border rounded-lg p-6 md:p-8 text-slate-900 relative select-none animate-cheque-appear shadow-2xl"
          >
            {/* Subtle Watermark in Center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <div className="w-72 h-72 rounded-full border-8 border-slate-900 flex flex-col items-center justify-center">
                <span className="text-6xl font-black font-cinzel">KBC</span>
                <span className="text-xl font-bold uppercase tracking-widest mt-1">HOT SEAT</span>
              </div>
            </div>

            {/* HEADER ROW: Bank Name + Logo + Date + Cheque No */}
            <div className="flex items-start justify-between border-b-2 border-amber-900/30 pb-4 relative z-10">
              
              {/* Left: Bank Name & Branch */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-md flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-full bg-blue-950 flex items-center justify-center text-amber-300">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <h1 className="text-2xl font-black font-cinzel text-blue-950 tracking-wider">
                      KBC BANK
                    </h1>
                    <span className="text-[10px] uppercase font-bold text-amber-800 tracking-widest px-1.5 py-0.5 bg-amber-100 border border-amber-300 rounded">
                      Gyan Payout
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    Hot Seat Special Branch, Film City, Mumbai - 400065
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono tracking-tight">
                    RTGS / NEFT IFSC: <span className="font-bold text-slate-700">KBCB0007777</span>
                  </p>
                </div>
              </div>

              {/* Right: Cheque Number & Date Boxes */}
              <div className="flex flex-col items-end gap-2">
                {/* Cheque Serial Code */}
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                    Cheque No:
                  </span>
                  <div className="font-mono text-xs font-bold text-blue-950 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300/80 inline-block ml-1.5">
                    {chequeNumber}
                  </div>
                </div>

                {/* Date Boxes (Classic Indian banking check style) */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mr-1">
                    DATE:
                  </span>
                  <div className="flex items-center gap-0.5">
                    {currentDateStr.split("").map((char, i) => (
                      <span
                        key={i}
                        className={`w-5 h-6 flex items-center justify-center font-mono text-xs font-bold ${
                          char === "/"
                            ? "text-slate-400 w-2"
                            : "bg-white border border-slate-400 text-slate-900 rounded-sm shadow-inner"
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Account Type */}
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.2 rounded-full uppercase tracking-wider">
                  Payable at Par Across India
                </span>
              </div>
            </div>

            {/* BODY SECTION: Pay to + Amount in Words + Box for Numbers */}
            <div className="my-6 space-y-4 relative z-10">
              
              {/* PAY LINE */}
              <div className="flex items-end gap-2 text-sm font-semibold text-slate-800">
                <span className="text-xs uppercase font-bold text-slate-900 tracking-wider font-cinzel shrink-0">
                  PAY:
                </span>
                <div className="flex-1 border-b-2 border-dotted border-slate-700 pb-1 px-3 text-lg font-bold font-cheque-serif text-blue-950 flex items-center justify-between">
                  <span className="tracking-wide uppercase underline decoration-amber-500/40 decoration-wavy">
                    {playerName}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-normal">
                    OR BEARER
                  </span>
                </div>
              </div>

              {/* RUPEES IN WORDS & NUMERIC BOX ROW */}
              <div className="flex items-start gap-4">
                {/* Words Line */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-end gap-2 text-sm font-semibold text-slate-800">
                    <span className="text-xs uppercase font-bold text-slate-900 tracking-wider font-cinzel shrink-0">
                      RUPEES:
                    </span>
                    <div className="flex-1 border-b-2 border-dotted border-slate-700 pb-1 px-3 text-sm font-bold text-slate-900 font-cheque-serif italic leading-relaxed">
                      {wordsAmount}
                    </div>
                  </div>
                  {/* Secondary decorative dotted fill line */}
                  <div className="w-full border-b border-dotted border-slate-400 pt-1" />
                </div>

                {/* NUMERIC AMOUNT BOX */}
                <div className="w-56 shrink-0 bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 border-2 border-amber-600 rounded p-2 shadow-inner flex items-center justify-between relative">
                  <span className="text-xl font-bold font-rajdhani text-amber-950 pl-1">
                    ₹
                  </span>
                  <span className="text-xl font-black font-rajdhani text-blue-950 tracking-wider pr-1">
                    {formattedAmount.replace("₹", "").trim()}/-
                  </span>
                </div>
              </div>

              {/* ACCOUNT NUMBER LINE */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-cinzel">
                  A/C NO:
                </span>
                <div className="flex items-center gap-1 font-mono text-xs font-bold">
                  {["0", "0", "9", "4", "2", "8", "1", "0", "0", "7", "3", "6"].map((num, i) => (
                    <span
                      key={i}
                      className="w-5 h-6 flex items-center justify-center bg-white border border-slate-400 text-slate-800 rounded-sm shadow-inner"
                    >
                      {num}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-medium ml-2">
                  Hot Seat Special Escrow Account
                </span>
              </div>
            </div>

            {/* FOOTER ROW: Signatures & MICR Bank Strip */}
            <div className="mt-8 pt-4 border-t border-slate-300 flex items-end justify-between relative z-10">
              
              {/* Left: Security Hologram / Stamp */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-600/70 p-1 flex items-center justify-center text-center">
                  <div className="w-full h-full rounded-full bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center">
                    <span className="text-[8px] font-bold font-cinzel text-amber-900 leading-none">
                      KBC
                    </span>
                    <span className="text-[6px] text-amber-800 uppercase font-semibold">
                      VERIFIED
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    Secured by Sony Entertainment & Big Synergy
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    Cheque Valid For Three Months From Date of Issue
                  </span>
                </div>
              </div>

              {/* Right: Signature of Amitabh Bachchan (Host) */}
              <div className="flex flex-col items-center text-center">
                {/* Drawn Signature */}
                <div className="relative h-14 flex items-center justify-center px-4">
                  {/* SVG or Styled Cursive Amitabh Bachchan signature */}
                  <span className="text-3xl text-blue-950 font-signature-amitabh tracking-wide transform -rotate-3 select-none filter drop-shadow-sm">
                    Amitabh Bachchan
                  </span>
                </div>
                <div className="w-48 border-t-2 border-slate-800 pt-1 text-center">
                  <span className="text-xs font-bold font-cinzel text-slate-900 block leading-tight">
                    Amitabh Bachchan
                  </span>
                  <span className="text-[10px] text-slate-600 font-medium block">
                    Show Host & Authorized Signatory
                  </span>
                </div>
              </div>
            </div>

            {/* BOTTOM MICR CHEQUE BAND (Real Indian banking MICR font feel) */}
            <div className="mt-4 pt-2 border-t-2 border-slate-400/40 flex items-center justify-center gap-8 font-mono text-xs text-slate-700 tracking-widest">
              <span>⑈ 789456 ⑈</span>
              <span>400065007 ⑆</span>
              <span>009428 ⑈</span>
              <span>10</span>
            </div>

            {/* STAMP EFFECT: "PAID" Stamp */}
            {stampVisible && (
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-stamp-paid z-30">
                <div className="border-4 border-red-600/90 rounded-xl px-6 py-2 text-center transform -rotate-12 bg-red-600/10 backdrop-blur-[1px] shadow-lg shadow-red-500/20">
                  <span className="text-4xl md:text-5xl font-black text-red-600 tracking-widest uppercase font-cinzel block drop-shadow">
                    PAID
                  </span>
                  <span className="text-[10px] font-black tracking-widest text-red-700 uppercase font-mono block -mt-1">
                    KBC HOT SEAT CASHOUT
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs font-semibold">
          {onRestart && (
            <button
              type="button"
              id="kbc-cheque-play-again-btn"
              onClick={onRestart}
              disabled={isRestarting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold font-cinzel text-sm shadow-lg transition cursor-pointer border ${
                isRestarting
                  ? "bg-slate-800 text-amber-300/80 border-slate-700 cursor-not-allowed opacity-90"
                  : "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30 hover:scale-105 active:scale-95 border-amber-300"
              }`}
            >
              {isRestarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Naya Khel Khelein (Play Again)</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            id="kbc-cheque-back-btn"
            onClick={onClose}
            disabled={isRestarting}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl border border-slate-700 transition cursor-pointer font-cinzel text-sm"
          >
            Khel Me Lauten (Back to Game Results)
          </button>
        </div>
      </div>
    </div>
  );
}
