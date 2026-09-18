import React from "react";
import { Globe, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

/**
 * LanguageSelector Component
 * Modal that appears before the game begins to select game language:
 * - Hindi (हिंदी)
 * - English
 */
export default function LanguageSelector({
  isOpen,
  selectedLanguage,
  onSelectLanguage,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      id="kbc-language-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 border-2 border-amber-400/80 rounded-2xl p-6 md:p-8 shadow-2xl shadow-blue-950/90 text-center kbc-hex-box overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="relative flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 mb-3 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <Globe className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-bold font-cinzel text-amber-300 tracking-wider">
            Choose Your Language
          </h2>
          <p className="text-sm font-semibold text-amber-200/90 mt-0.5">
            अपनी भाषा चुनें
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">
            Select your preferred language for the question presentation. Options will remain in standard format.
          </p>
        </div>

        {/* Language Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* HINDI OPTION */}
          <button
            type="button"
            id="lang-select-hindi"
            onClick={() => onSelectLanguage("hi")}
            className={`relative group p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer ${
              selectedLanguage === "hi"
                ? "bg-gradient-to-b from-amber-500/20 via-blue-900/40 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40"
                : "bg-slate-900/70 border-slate-700 hover:border-amber-400/60 hover:bg-slate-850"
            }`}
          >
            {selectedLanguage === "hi" && (
              <div className="absolute top-2.5 right-2.5 text-amber-400">
                <CheckCircle2 className="w-5 h-5 fill-amber-400 text-slate-950" />
              </div>
            )}
            <span className="text-3xl mb-1">🇮🇳</span>
            <span className="text-lg font-bold text-amber-300 font-cinzel">
              हिंदी
            </span>
            <span className="text-xs font-semibold text-slate-300 mt-0.5">
              Hindi
            </span>
            <span className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" /> AI Translated Questions
            </span>
          </button>

          {/* ENGLISH OPTION */}
          <button
            type="button"
            id="lang-select-english"
            onClick={() => onSelectLanguage("en")}
            className={`relative group p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer ${
              selectedLanguage === "en"
                ? "bg-gradient-to-b from-amber-500/20 via-blue-900/40 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40"
                : "bg-slate-900/70 border-slate-700 hover:border-amber-400/60 hover:bg-slate-850"
            }`}
          >
            {selectedLanguage === "en" && (
              <div className="absolute top-2.5 right-2.5 text-amber-400">
                <CheckCircle2 className="w-5 h-5 fill-amber-400 text-slate-950" />
              </div>
            )}
            <span className="text-3xl mb-1">🇬🇧</span>
            <span className="text-lg font-bold text-amber-300 font-cinzel">
              English
            </span>
            <span className="text-xs font-semibold text-slate-300 mt-0.5">
              Original Format
            </span>
            <span className="text-[10px] text-blue-300 mt-1 flex items-center gap-1 font-medium">
              Instant Load • OpenTDB
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition"
          >
            Cancel (रद्द करें)
          </button>
          <button
            type="button"
            id="kbc-confirm-language-btn"
            onClick={onConfirm}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/30 font-cinzel transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Aage Badhein (Proceed)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
