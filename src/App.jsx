import React, { useState, useEffect, useRef } from "react";
import Game from "./components/Game";
import LanguageSelector from "./components/LanguageSelector";
import { fetchQuestions, getOrInitSessionToken } from "./utils/questionFetcher";
import { 
  Play, 
  Award, 
  HelpCircle, 
  Flame, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Globe
} from "lucide-react";
import { sounds } from "./utils/soundEffects";

export default function App() {
  const [gameState, setGameState] = useState("START"); // "START" | "LOADING" | "PLAYING" | "ERROR"
  const [questions, setQuestions] = useState([]);
  const [playerName, setPlayerName] = useState("Hot Seat Khiladi");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Language state: "en" | "hi"
  const [selectedLanguage, setSelectedLanguage] = useState("hi");
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Fetching questions…");
  const [loadingElapsed, setLoadingElapsed] = useState(0);
  const isFetchingRef = useRef(false);

  // Initialize OpenTDB session token on first app load
  useEffect(() => {
    getOrInitSessionToken();
  }, []);

  // Track elapsed loading seconds
  useEffect(() => {
    let interval;
    if (gameState === "LOADING") {
      setLoadingElapsed(0);
      interval = setInterval(() => {
        setLoadingElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState]);

  // Audio toggles
  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleSpeech = () => {
    const speech = sounds.toggleSpeech();
    setSpeechEnabled(speech);
  };

  // User clicks the initial "Start Game" button -> opens Language Selection modal
  const handlePromptLanguageSelection = () => {
    sounds.initCtx();
    sounds.playLifeline();
    setIsLanguageModalOpen(true);
  };

  // Launch game after confirming language
  const handleConfirmStartGame = async (langToUse = selectedLanguage) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setIsLanguageModalOpen(false);
    setGameState("LOADING");
    setErrorMessage("");
    setLoadingStage("Fetching questions…");
    setTranslationProgress(0);

    try {
      sounds.initCtx();
      sounds.playLifeline();

      if (speechEnabled) {
        if (langToUse === "hi") {
          sounds.speak("Kaun Banega Crorepati mein aapka swagat hai!", "hi");
        } else {
          sounds.speak("Welcome to Kaun Banega Crorepati!", "en");
        }
      }

      // Fetch 17 ordered questions based on selected language
      const fetched = await fetchQuestions(langToUse, (stage, progress) => {
        if (stage) setLoadingStage(stage);
        if (typeof progress === "number") setTranslationProgress(progress);
      });

      if (fetched && fetched.length === 17) {
        setQuestions(fetched);
        setGameState("PLAYING");
      } else {
        throw new Error("Could not assemble all 17 questions");
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      setErrorMessage(
        langToUse === "hi"
          ? "Hindi translation or question fetch encountered an issue. You can retry or play directly in English."
          : "Could not load fresh questions from trivia sources. Please check your connection and try again."
      );
      setGameState("ERROR");
    } finally {
      isFetchingRef.current = false;
    }
  };

  // Restart game: fetches a fresh set of questions efficiently for the active language
  const handleRestartGame = async (langToUse = selectedLanguage) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setGameState("LOADING");
    setErrorMessage("");
    setLoadingStage("Fetching questions…");
    setTranslationProgress(0);

    try {
      sounds.initCtx();
      sounds.playLifeline();

      if (speechEnabled) {
        if (langToUse === "hi") {
          sounds.speak("Naya khel prarambh ho raha hai! Pehla sawaal aapki screen par.", "hi");
        } else {
          sounds.speak("Starting your new game! First question on your screen.", "en");
        }
      }

      // Fetch 17 fresh questions
      const fetched = await fetchQuestions(langToUse, (stage, progress) => {
        if (stage) setLoadingStage(stage);
        if (typeof progress === "number") setTranslationProgress(progress);
      });

      if (fetched && fetched.length === 17) {
        setQuestions(fetched);
        setGameState("PLAYING");
        return fetched;
      } else {
        throw new Error("Could not assemble all 17 questions");
      }
    } catch (err) {
      console.error("Failed to fetch fresh questions on restart:", err);
      setErrorMessage(
        langToUse === "hi"
          ? "Hindi translation or question fetch encountered an issue. You can retry or play directly in English."
          : "Could not load fresh questions. Please check your connection and try again."
      );
      setGameState("ERROR");
      throw err;
    } finally {
      isFetchingRef.current = false;
    }
  };

  // Fallback to English directly if translation failed
  const handleFallbackToEnglish = () => {
    setSelectedLanguage("en");
    handleConfirmStartGame("en");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black relative overflow-hidden font-outfit">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* LANGUAGE SELECTION MODAL */}
      <LanguageSelector
        isOpen={isLanguageModalOpen}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        onConfirm={() => handleConfirmStartGame(selectedLanguage)}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* START SCREEN */}
      {gameState === "START" && (
        <div id="kbc-start-screen" className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full text-center relative z-10 animate-fade-in">
          
          {/* Audio & Quick Preferences */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Quick Language Pill */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:border-amber-400 transition"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{selectedLanguage === "hi" ? "🇮🇳 हिंदी" : "🇬🇧 English"}</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-amber-400 transition"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={handleToggleSpeech}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-amber-400 transition"
              title={speechEnabled ? "Disable Host Speech" : "Enable Host Speech"}
            >
              {speechEnabled ? <Mic className="w-5 h-5 text-blue-400" /> : <MicOff className="w-5 h-5 text-slate-500" />}
            </button>
          </div>

          {/* KBC Official Style Golden Shield Emblem */}
          <div className="relative mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1.5 shadow-2xl shadow-amber-500/30 animate-pulse-slow">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-blue-950 via-slate-950 to-indigo-950 flex flex-col items-center justify-center border-2 border-amber-400/70 p-2">
                <span className="text-2xl md:text-3xl font-black font-cinzel text-amber-300 tracking-wider">
                  KBC
                </span>
                <span className="text-[10px] md:text-xs text-amber-200/80 font-rajdhani uppercase tracking-widest mt-0.5">
                  Crorepati
                </span>
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] md:text-xs font-black uppercase px-3 py-0.5 rounded-full border border-yellow-200 shadow font-rajdhani">
              Season Hot Seat
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-wider drop-shadow-md">
            Kaun Banega Crorepati
          </h1>
          <p className="text-sm md:text-base text-slate-300 mt-2 max-w-xl font-medium italic">
            "Gyan hi aapko aapka haq dilata hai"
          </p>

          {/* Hot Seat Contestant Name Input */}
          <div className="mt-6 w-full max-w-sm">
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-1.5 text-left">
              Hot Seat Khiladi (Player Name):
            </label>
            <input
              type="text"
              id="kbc-player-name-input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Apna Naam Likhein"
              className="w-full px-4 py-3 bg-slate-900/90 border-2 border-amber-500/40 focus:border-amber-400 rounded-xl text-white font-medium text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
            />
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6 w-full max-w-2xl text-left">
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">17 Questions</span>
                <span className="text-xs font-bold text-slate-200">Up to ₹7 Crore</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">3 Safe Padav</span>
                <span className="text-xs font-bold text-slate-200">Q5, Q10 & Q15</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">4 Lifelines</span>
                <span className="text-xs font-bold text-slate-200">50:50, Poll & Phone</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Dual Language</span>
                <span className="text-xs font-bold text-slate-200">Hindi & English</span>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            id="kbc-start-game-button"
            onClick={handlePromptLanguageSelection}
            className="group flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-base md:text-lg tracking-wider rounded-2xl border-2 border-yellow-200 shadow-2xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all font-cinzel uppercase cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Khel Shuru Karein (Start Game)</span>
          </button>
        </div>
      )}

      {/* LOADING SCREEN */}
      {gameState === "LOADING" && (
        <div id="kbc-loading-screen" className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in max-w-lg mx-auto">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-lg">
              {selectedLanguage === "hi" ? "🇮🇳" : "🇬🇧"}
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-bold font-cinzel text-amber-300">
            {selectedLanguage === "hi"
              ? "आपके सवाल हिंदी में तैयार किए जा रहे हैं…"
              : "Preparing your questions…"}
          </h2>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-xs font-semibold text-amber-300 mt-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{loadingStage}</span>
          </div>

          <p className="text-xs text-slate-400 mt-2 max-w-md">
            {selectedLanguage === "hi"
              ? "Computer Ji 17 विशेष सवाल (Bollywood, Blood Relation, Indian History, Sports & GK) तैयार कर रहे हैं..."
              : "Preloading 17 unique questions across Bollywood, Blood Relation, Indian History, Sports & General Knowledge..."}
          </p>

          {/* Progress Indicator for Hindi translation */}
          {selectedLanguage === "hi" && loadingStage.includes("Translating") && (
            <div className="w-full mt-4 max-w-xs">
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-amber-500/30">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-300 h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(25, translationProgress)}%` }}
                />
              </div>
            </div>
          )}

          {/* Fallback / Retry UI if loading exceeds 25 seconds */}
          {loadingElapsed > 25 && (
            <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 max-w-sm animate-fade-in text-center">
              <p className="text-xs text-amber-200 mb-3">
                {selectedLanguage === "hi"
                  ? "सवाल तैयार होने में अपेक्षा से अधिक समय लग रहा है। आप पुनः प्रयास कर सकते हैं या तुरंत अंग्रेजी में खेल सकते हैं।"
                  : "Loading is taking longer than expected. Would you like to retry or check your connection?"}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmStartGame(selectedLanguage)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Dobara Prayas (Retry)</span>
                </button>
                {selectedLanguage === "hi" && (
                  <button
                    type="button"
                    onClick={handleFallbackToEnglish}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition cursor-pointer border border-slate-700"
                  >
                    <span>Play in English Instead</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ERROR SCREEN */}
      {gameState === "ERROR" && (
        <div id="kbc-error-screen" className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-red-400 font-cinzel">Game Initialization Issue</h2>
          <p className="text-sm text-slate-300 mt-2">{errorMessage}</p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
            <button
              onClick={() => handleConfirmStartGame(selectedLanguage)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition text-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Dobara Prayas Karein (Retry)
            </button>
            {selectedLanguage === "hi" && (
              <button
                onClick={handleFallbackToEnglish}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white font-bold rounded-xl transition text-sm cursor-pointer"
              >
                <span>Play in English Instead</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE GAME ARENA */}
      {gameState === "PLAYING" && (
        <Game
          questions={questions}
          language={selectedLanguage}
          playerName={playerName}
          onRestartGame={handleRestartGame}
          onChangeLanguage={() => setIsLanguageModalOpen(true)}
        />
      )}

      {/* Footer */}
      <footer className="text-center py-2 text-[11px] text-slate-600 border-t border-slate-900 bg-slate-950/80">
        Kaun Banega Crorepati Clone • 17 Sawaal • ₹7 Crore Dhanrashi • OpenTDB & Gemini Powered
      </footer>
    </main>
  );
}
