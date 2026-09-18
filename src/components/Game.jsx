import React, { useState, useEffect, useCallback } from "react";
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  LogOut, 
  HelpCircle, 
  Flame, 
  Sparkles,
  ListOrdered
} from "lucide-react";
import Timer from "./Timer";
import Lifelines, { LIFELINE_TYPES } from "./Lifelines";
import PrizeLadder from "./PrizeLadder";
import Modal from "./Modal";
import Confetti from "./Confetti";
import PrizeCheque from "./PrizeCheque";
import { PRIZE_LADDER, calculatePrize, getWonPrize } from "../utils/prizeCalculator";
import { sounds } from "../utils/soundEffects";
import { fetchFlipQuestionReplacement } from "../utils/questionFetcher";

export default function Game({ 
  questions, 
  onRestartGame,
  language = "en",
  playerName = "Hot Seat Khiladi",
  onChangeLanguage
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [answerState, setAnswerState] = useState(null); // null | "correct" | "wrong"
  const [eliminatedOptions, setEliminatedOptions] = useState([]); // for 50:50
  const [modalState, setModalState] = useState({ isOpen: false, type: null, data: null });
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [isJackpot, setIsJackpot] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [showMobileLadder, setShowMobileLadder] = useState(false);
  const [extraQuestionIndex, setExtraQuestionIndex] = useState(17); // for flip question
  const [isRestarting, setIsRestarting] = useState(false);
  const [isFlippingQuestion, setIsFlippingQuestion] = useState(false);
  const [gameSessionId, setGameSessionId] = useState(0);

  // Prize Cheque state
  const [showCheque, setShowCheque] = useState(false);
  const [chequePrizeAmount, setChequePrizeAmount] = useState(0);
  const [chequeIsJackpot, setChequeIsJackpot] = useState(false);
  const [chequeIsQuit, setChequeIsQuit] = useState(false);

  // Used lifelines map
  const [usedLifelines, setUsedLifelines] = useState({
    [LIFELINE_TYPES.FIFTY_FIFTY]: false,
    [LIFELINE_TYPES.AUDIENCE_POLL]: false,
    [LIFELINE_TYPES.PHONE_FRIEND]: false,
    [LIFELINE_TYPES.FLIP_QUESTION]: false,
  });

  const currentQuestion = questions[currentIndex];
  const currentTier = PRIZE_LADDER[currentIndex] || PRIZE_LADDER[PRIZE_LADDER.length - 1];
  const currentEarnings = getWonPrize(currentIndex);

  // When a new question loads, reset states and announce
  useEffect(() => {
    setSelectedOption(null);
    setIsLocked(false);
    setAnswerState(null);
    setEliminatedOptions([]);
    sounds.startSuspense();

    if (currentQuestion && speechEnabled && !isMuted) {
      const qPrefix = language === "hi" 
        ? `प्रशन संख्या ${currentIndex + 1}, ${currentTier.formatted} के लिए: `
        : `Question number ${currentIndex + 1} for ${currentTier.formatted}: `;
      sounds.speak(`${qPrefix} ${currentQuestion.question}`, language);
    }

    return () => {
      sounds.stopSuspense();
    };
  }, [currentIndex, currentQuestion, speechEnabled, isMuted, currentTier.formatted]);

  // Audio toggles
  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleSpeech = () => {
    const speech = sounds.toggleSpeech();
    setSpeechEnabled(speech);
  };

  // Re-read question aloud
  const handleReadQuestionAloud = () => {
    if (!currentQuestion) return;
    const prompt = `Question ${currentIndex + 1}: ${currentQuestion.question}. Option A: ${currentQuestion.options[0]}. Option B: ${currentQuestion.options[1]}. Option C: ${currentQuestion.options[2]}. Option D: ${currentQuestion.options[3]}.`;
    sounds.speak(prompt);
  };

  // Selection
  const handleSelectOption = (option) => {
    if (isLocked || answerState) return;
    if (eliminatedOptions.includes(option)) return;
    setSelectedOption(option);
  };

  // Lock answer ("Computer ji, lock kiya jaye!")
  const handleLockAnswer = () => {
    if (!selectedOption || isLocked || answerState) return;
    setIsLocked(true);
    sounds.stopSuspense();
    sounds.playLock();

    const optIndex = currentQuestion.options.indexOf(selectedOption);
    const letter = ["A", "B", "C", "D"][optIndex] || "";
    if (speechEnabled) {
      sounds.speak(`Option ${letter} ko lock kiya jaye!`);
    }

    // Suspense countdown of 2.2 seconds before answer reveal
    setTimeout(() => {
      const isCorrect = selectedOption === currentQuestion.correctAnswer;
      if (isCorrect) {
        setAnswerState("correct");
        sounds.playCorrect();

        const isLastQuestion = currentIndex === PRIZE_LADDER.length - 1;
        const reachedMilestone = currentTier.isMilestone;

        if (isLastQuestion) {
          // 7 Crore win!
          setIsJackpot(true);
          setConfettiTrigger(true);
          sounds.playGrandWin();
          if (speechEnabled) {
            sounds.speak("Adbhut! Anokha! Aap jeet chuke hain pure saat crore rupaye!");
          }
          setTimeout(() => {
            setModalState({
              isOpen: true,
              type: "GAME_OVER",
              data: {
                isWin: true,
                isJackpot: true,
                finalPrizeAmount: currentTier.amount,
                milestoneReached: true,
              },
            });

            // Automatically celebrate with the ₹7 Crore Prize Cheque
            setTimeout(() => {
              triggerPrizeCheque(currentTier.amount, true, false);
            }, 800);
          }, 2500);
        } else {
          // Normal correct answer
          if (reachedMilestone) {
            setConfettiTrigger(true);
            sounds.playGrandWin();
            if (speechEnabled) {
              sounds.speak(`Badhaai ho! Aapne padav paar kar liya aur jeete ${currentTier.formatted}!`);
            }
          } else {
            if (speechEnabled) {
              sounds.speak(`Sahi jawab! Aap jeet gaye ${currentTier.formatted}!`);
            }
          }

          // Advance to next question after 2.5 seconds
          setTimeout(() => {
            setConfettiTrigger(false);
            setCurrentIndex((prev) => prev + 1);
          }, 2600);
        }
      } else {
        // Wrong answer!
        setAnswerState("wrong");
        sounds.playWrong();
        if (speechEnabled) {
          sounds.speak("Afsos! Yeh galat uttar hai!");
        }

        // Calculate milestone prize
        const guaranteed = calculatePrize(currentIndex);

        setTimeout(() => {
          setModalState({
            isOpen: true,
            type: "GAME_OVER",
            data: {
              isWin: false,
              isJackpot: false,
              correctAnswer: currentQuestion.correctAnswer,
              finalPrizeAmount: guaranteed.amount,
              milestoneReached: guaranteed.amount > 0,
            },
          });
        }, 2500);
      }
    }, 2200);
  };

  // Time Out handler
  const handleTimeUp = useCallback(() => {
    if (isLocked || answerState) return;
    setIsLocked(true);
    setAnswerState("wrong");
    sounds.playWrong();
    if (speechEnabled) {
      sounds.speak("Samay samapt! Samay ki ghanti baj chuki hai!");
    }

    const guaranteed = calculatePrize(currentIndex);
    setTimeout(() => {
      setModalState({
        isOpen: true,
        type: "GAME_OVER",
        data: {
          isWin: false,
          isJackpot: false,
          correctAnswer: currentQuestion?.correctAnswer || "",
          finalPrizeAmount: guaranteed.amount,
          milestoneReached: guaranteed.amount > 0,
        },
      });
    }, 1800);
  }, [isLocked, answerState, speechEnabled, currentIndex, currentQuestion]);

  // Quit / Walk away confirmation
  const handlePromptQuit = () => {
    if (isLocked || answerState) return;
    setModalState({
      isOpen: true,
      type: "CONFIRM_QUIT",
      data: {
        winnings: currentEarnings,
      },
    });
  };

  const handleConfirmQuit = () => {
    const finalAmount = currentEarnings.amount;
    setModalState({
      isOpen: true,
      type: "GAME_OVER",
      data: {
        isWin: false,
        isQuit: true,
        finalPrizeAmount: finalAmount,
        milestoneReached: false,
      },
    });

    // Auto-present the prize cheque when user quits with prize money
    if (finalAmount > 0) {
      setTimeout(() => {
        triggerPrizeCheque(finalAmount, false, true);
      }, 700);
    }
  };

  const triggerPrizeCheque = (amt, isJackpotWin = false, isQuitWalkaway = false) => {
    setChequePrizeAmount(amt);
    setChequeIsJackpot(isJackpotWin);
    setChequeIsQuit(isQuitWalkaway);
    setShowCheque(true);
  };

  // Restart Game: Clears old questions, resets ladder & lifelines, and loads fresh Q1
  const handleRestart = async () => {
    if (isRestarting) return;
    setIsRestarting(true);

    try {
      sounds.initCtx();
      sounds.playLifeline();

      // Immediately close the prize cheque and Game Over modal so user sees full-screen loading state
      setShowCheque(false);
      setModalState({ isOpen: false, type: null, data: null });

      // Reset all game state to Q1 clean slate
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsLocked(false);
      setAnswerState(null);
      setEliminatedOptions([]);
      setIsJackpot(false);
      setConfettiTrigger(false);
      setShowMobileLadder(false);
      setExtraQuestionIndex(17);
      setUsedLifelines({
        [LIFELINE_TYPES.FIFTY_FIFTY]: false,
        [LIFELINE_TYPES.AUDIENCE_POLL]: false,
        [LIFELINE_TYPES.PHONE_FRIEND]: false,
        [LIFELINE_TYPES.FLIP_QUESTION]: false,
      });

      // Advance gameSessionId so Timer remounts fresh with 45 seconds
      setGameSessionId((prev) => prev + 1);

      // Fetch fresh set of questions from App
      if (onRestartGame) {
        await onRestartGame();
      }
    } catch (err) {
      console.error("Failed to restart game with fresh questions:", err);
    } finally {
      setIsRestarting(false);
    }
  };

  // Lifelines handling
  const handleUseLifeline = (type) => {
    if (usedLifelines[type] || isLocked || answerState) return;

    setUsedLifelines((prev) => ({ ...prev, [type]: true }));

    switch (type) {
      case LIFELINE_TYPES.FIFTY_FIFTY: {
        // Eliminate 2 incorrect options
        const incorrect = currentQuestion.options.filter(
          (opt) => opt !== currentQuestion.correctAnswer
        );
        // Shuffle incorrect and take 2
        const toEliminate = incorrect.slice(0, 2);
        setEliminatedOptions(toEliminate);
        if (speechEnabled) {
          sounds.speak("Computer ji, do galat vikalp hata diye jayein!");
        }
        break;
      }

      case LIFELINE_TYPES.AUDIENCE_POLL: {
        // Audience heavily favors correct answer
        const optLetters = ["A", "B", "C", "D"];
        const correctOptIndex = currentQuestion.options.indexOf(currentQuestion.correctAnswer);
        const correctLetter = optLetters[correctOptIndex];

        // Random skewed distribution
        const correctPercent = Math.floor(Math.random() * 25) + 60; // 60% to 85%
        const remainder = 100 - correctPercent;
        const p1 = Math.floor(Math.random() * (remainder - 10));
        const p2 = Math.floor(Math.random() * (remainder - p1 - 5));
        const p3 = remainder - p1 - p2;

        const otherLetters = optLetters.filter((l) => l !== correctLetter);
        const pollResults = {
          [correctLetter]: correctPercent,
          [otherLetters[0]]: p1,
          [otherLetters[1]]: p2,
          [otherLetters[2]]: p3,
        };

        setModalState({
          isOpen: true,
          type: "AUDIENCE_POLL",
          data: { pollResults },
        });

        if (speechEnabled) {
          sounds.speak(`Audience vote has favored Option ${correctLetter} with ${correctPercent} percent.`);
        }
        break;
      }

      case LIFELINE_TYPES.PHONE_FRIEND: {
        // Friend advice
        const optLetters = ["A", "B", "C", "D"];
        const correctOptIndex = currentQuestion.options.indexOf(currentQuestion.correctAnswer);
        const correctLetter = optLetters[correctOptIndex];
        const confidence = Math.floor(Math.random() * 15) + 82; // 82% to 96%

        setModalState({
          isOpen: true,
          type: "PHONE_FRIEND",
          data: {
            friendName: "Dr. Arvind Pathak (Trivia Expert)",
            friendConfidence: confidence,
            friendAdvice: `Hello! I'm pretty certain the correct answer is Option ${correctLetter} (${currentQuestion.correctAnswer}). I read this in an encyclopedia recently!`,
          },
        });

        if (speechEnabled) {
          sounds.speak(`Your friend suggests Option ${correctLetter} with ${confidence} percent confidence.`);
        }
        break;
      }

      case LIFELINE_TYPES.FLIP_QUESTION: {
        setIsFlippingQuestion(true);
        if (speechEnabled) {
          sounds.speak("Computer ji, agla naya sawaal prastut kiya jaye!");
        }
        (async () => {
          try {
            const freshQuestion = await fetchFlipQuestionReplacement(currentQuestion, language);
            if (freshQuestion) {
              questions[currentIndex] = freshQuestion;
              setSelectedOption(null);
              setEliminatedOptions([]);
            }
          } catch (flipErr) {
            console.warn("Flip question replacement error:", flipErr);
          } finally {
            setIsFlippingQuestion(false);
          }
        })();
        break;
      }

      default:
        break;
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg text-slate-300">Loading KBC questions...</p>
      </div>
    );
  }

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div id="kbc-game-arena" className="flex flex-col w-full max-w-7xl mx-auto min-h-screen px-2 md:px-6 py-3 relative">
      <Confetti trigger={confettiTrigger} isJackpot={isJackpot} />

      {/* TOP CONTROL BAR */}
      <header className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-blue-900/60">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border border-amber-400/50">
              <span className="font-extrabold text-xs font-cinzel text-amber-300 tracking-tighter">
                KBC
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold font-cinzel text-amber-400 tracking-wider">
              Kaun Banega Crorepati
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
              <span>Question {currentIndex + 1} of 17</span>
              <span>•</span>
              <span className={`capitalize font-semibold ${
                currentQuestion.difficulty?.toLowerCase() === "easy" 
                  ? "text-emerald-400" 
                  : currentQuestion.difficulty?.toLowerCase() === "medium" 
                  ? "text-amber-400" 
                  : "text-red-400"
              }`}>
                {currentQuestion.difficulty ? `${currentQuestion.difficulty} Level` : "Standard"}
              </span>
              <span>•</span>
              <span className="capitalize text-blue-400 font-semibold truncate max-w-[120px]">{currentQuestion.category}</span>
            </div>
          </div>
        </div>

        {/* Center: Current question prize target */}
        <div className="hidden sm:flex flex-col items-center bg-slate-900/80 border border-amber-500/40 px-4 py-1 rounded-xl">
          <span className="text-[10px] uppercase text-amber-400 font-semibold tracking-widest">
            Sawaal Dhanrashi
          </span>
          <span className="text-lg font-bold text-amber-300 font-rajdhani">
            {currentTier.formatted}
          </span>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Language Badge (clickable if onChangeLanguage is provided) */}
          <button
            type="button"
            id="kbc-language-badge"
            onClick={onChangeLanguage}
            disabled={!onChangeLanguage}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-slate-900/90 text-amber-300 text-xs font-bold shadow ${
              onChangeLanguage ? "hover:border-amber-400 hover:bg-slate-800 transition cursor-pointer" : ""
            }`}
            title={`Active Language: ${language === "hi" ? "Hindi (हिंदी)" : "English"}${onChangeLanguage ? " - Click to change" : ""}`}
          >
            <span className="text-sm">{language === "hi" ? "🇮🇳" : "🇬🇧"}</span>
            <span className="hidden sm:inline font-cinzel">
              {language === "hi" ? "Hindi" : "English"}
            </span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-lg border transition ${
              isMuted
                ? "bg-red-950/60 border-red-500/40 text-red-400"
                : "bg-slate-900/80 border-slate-700 text-slate-300 hover:text-amber-300"
            }`}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Speech toggle */}
          <button
            onClick={handleToggleSpeech}
            className={`p-2 rounded-lg border transition ${
              !speechEnabled
                ? "bg-slate-900/80 border-slate-700 text-slate-500"
                : "bg-blue-950/60 border-blue-500/40 text-blue-300 hover:text-amber-300"
            }`}
            title={speechEnabled ? "Disable Host Speech" : "Enable Host Speech"}
          >
            {speechEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Rules Modal */}
          <button
            onClick={() => setModalState({ isOpen: true, type: "RULES" })}
            className="p-2 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-amber-300 transition"
            title="Show Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Mobile Ladder toggle */}
          <button
            onClick={() => setShowMobileLadder(!showMobileLadder)}
            className="lg:hidden p-2 rounded-lg border border-amber-500/40 bg-slate-900/80 text-amber-400 hover:bg-slate-800 transition"
            title="Toggle Ladder"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Quit / Walk Away */}
          <button
            onClick={handlePromptQuit}
            disabled={isLocked || answerState !== null}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quit</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT: ARENA + PRIZE LADDER */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch relative">
        {/* LEFT / CENTER HOT SEAT (8 Cols on LG) */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-4">
          
          {/* Lifelines & Timer Bar */}
          <div className="flex items-center justify-between gap-2 px-1">
            <Lifelines
              usedLifelines={usedLifelines}
              onUseLifeline={handleUseLifeline}
              disabled={isLocked || answerState !== null}
              currentQuestionIndex={currentIndex}
            />

            <Timer
              key={`timer-${currentIndex}-${gameSessionId}`}
              questionIndex={currentIndex}
              isActive={!answerState && !modalState.isOpen}
              isPaused={isLocked || modalState.isOpen}
              onTimeUp={handleTimeUp}
            />
          </div>

          {/* CENTER STAGE: QUESTION DISPLAY */}
          <div className="flex-1 flex flex-col justify-center items-center my-auto py-2">
            
            {/* Question Outer Box with KBC styled borders */}
            <div className="relative w-full max-w-3xl">
              {/* Horizontal decorative side connector lines */}
              <div className="hidden md:block absolute -left-6 top-1/2 w-6 h-[2px] bg-gradient-to-r from-transparent to-amber-400/80 -translate-y-1/2" />
              <div className="hidden md:block absolute -right-6 top-1/2 w-6 h-[2px] bg-gradient-to-l from-transparent to-amber-400/80 -translate-y-1/2" />

              <div 
                id="kbc-question-card" 
                className="relative bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 border-2 border-amber-400/80 rounded-2xl p-6 md:p-8 shadow-2xl shadow-blue-950/90 text-center kbc-hex-box"
              >
                {/* Question Info Bar: Difficulty & Category & Milestone */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                  {/* Difficulty Badge */}
                  {currentQuestion.difficulty && (
                    <span
                      id="kbc-difficulty-badge"
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold uppercase tracking-wider border ${
                        currentQuestion.difficulty.toLowerCase() === "easy"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                          : currentQuestion.difficulty.toLowerCase() === "medium"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                          : currentQuestion.difficulty.toLowerCase() === "medium-hard"
                          ? "bg-orange-500/15 text-orange-400 border-orange-500/40"
                          : currentQuestion.difficulty.toLowerCase() === "hardest"
                          ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                          : "bg-red-500/15 text-red-400 border-red-500/40"
                      }`}
                    >
                      {currentQuestion.difficulty.toLowerCase() === "easy"
                        ? "Easy"
                        : currentQuestion.difficulty.toLowerCase() === "medium"
                        ? "Medium"
                        : currentQuestion.difficulty.toLowerCase() === "medium-hard"
                        ? "Medium-Hard"
                        : currentQuestion.difficulty.toLowerCase() === "hardest"
                        ? "Hardest"
                        : "Hard"}
                    </span>
                  )}

                  {/* Category Pill */}
                  {currentQuestion.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-blue-900/50 border border-blue-500/40 text-blue-200 truncate max-w-[220px]">
                      {currentQuestion.category}
                    </span>
                  )}

                  {/* Milestone indicator banner */}
                  {currentTier.isMilestone && (
                    <div className="inline-flex items-center gap-1 px-3 py-0.5 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-semibold uppercase tracking-wider">
                      {currentTier.isJackpot ? (
                        <>
                          <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                          <span>Padav 4: 7 Crore Jackpot!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Padav {currentTier.milestoneNumber} Safe Milestone!</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Question text or Flipping Spinner */}
                {isFlippingQuestion ? (
                  <div className="flex flex-col items-center justify-center min-h-[4rem] py-4 gap-2">
                    <div className="w-7 h-7 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                    <span className="text-xs text-amber-300 font-medium">
                      {language === "hi"
                        ? "Computer Ji, Flip Question तैयार कर रहे हैं…"
                        : "Preparing your replacement question…"}
                    </span>
                  </div>
                ) : (
                  <h2 className="text-base md:text-xl lg:text-2xl font-bold font-outfit text-white leading-relaxed tracking-wide min-h-[4rem] flex items-center justify-center">
                    {currentQuestion.question}
                  </h2>
                )}

                {/* Read aloud icon button */}
                <button
                  onClick={handleReadQuestionAloud}
                  className="absolute bottom-2 right-4 text-slate-400 hover:text-amber-300 p-1 text-xs flex items-center gap-1 transition"
                  title="Re-read question"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Bol Kar Suniye</span>
                </button>
              </div>
            </div>

            {/* 4 OPTIONS IN 2X2 GRID */}
            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {currentQuestion.options.map((option, index) => {
                const letter = optionLetters[index];
                const isSelected = selectedOption === option;
                const isEliminated = eliminatedOptions.includes(option);
                const isCorrect = option === currentQuestion.correctAnswer;

                // State colors
                let boxClasses = "bg-gradient-to-b from-slate-900 to-blue-950 border-amber-400/40 text-slate-200 hover:border-amber-400 hover:text-white";

                if (isEliminated) {
                  boxClasses = "bg-slate-950/40 border-slate-800 text-transparent pointer-events-none select-none opacity-20";
                } else if (answerState === "correct" && isCorrect) {
                  // Flashing green
                  boxClasses = "bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-slate-950 font-bold border-emerald-300 shadow-xl shadow-emerald-500/40 animate-pulse scale-[1.02]";
                } else if (answerState === "wrong" && isSelected) {
                  // Flashing red
                  boxClasses = "bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold border-red-400 shadow-xl shadow-red-500/40";
                } else if (answerState === "wrong" && isCorrect) {
                  // Reveal correct answer in green
                  boxClasses = "bg-gradient-to-r from-emerald-600 to-green-600 text-slate-950 font-bold border-emerald-300 animate-bounce";
                } else if (isLocked && isSelected) {
                  // Amber lock tension
                  boxClasses = "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-bold border-yellow-200 shadow-xl shadow-amber-500/50 animate-pulse scale-[1.01]";
                } else if (isSelected) {
                  // Selected before locking
                  boxClasses = "bg-gradient-to-r from-amber-600/90 to-amber-500/90 text-slate-950 font-bold border-amber-300 shadow-lg shadow-amber-500/30 scale-[1.01]";
                }

                return (
                  <button
                    key={index}
                    id={`kbc-option-${letter}`}
                    type="button"
                    disabled={isLocked || isEliminated || answerState !== null}
                    onClick={() => handleSelectOption(option)}
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer kbc-hex-box-sm ${boxClasses}`}
                  >
                    {/* Letter badge */}
                    <span 
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold font-rajdhani border ${
                        isSelected || (answerState === "correct" && isCorrect)
                          ? "bg-slate-950 text-amber-300 border-amber-300"
                          : "bg-blue-950 text-amber-400 border-amber-500/50"
                      }`}
                    >
                      {letter}
                    </span>

                    {/* Option Text */}
                    <span className="text-sm md:text-base font-medium flex-1 line-clamp-2">
                      {isEliminated ? "—" : option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* LOCK ANSWER ACTION BAR */}
            <div className="w-full max-w-3xl flex items-center justify-center mt-4 min-h-[3rem]">
              {selectedOption && !isLocked && !answerState && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <button
                    id="kbc-lock-button"
                    onClick={handleLockAnswer}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm md:text-base tracking-wider rounded-xl border-2 border-amber-300 shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition font-cinzel uppercase"
                  >
                    🔒 Computer Ji, Lock Kiya Jaye!
                  </button>
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
                  >
                    Badlein (Change)
                  </button>
                </div>
              )}

              {isLocked && !answerState && (
                <div className="text-amber-400 font-bold font-rajdhani text-sm md:text-base animate-pulse flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  Computer ji lock kar rahe hain... (Verifying answer...)
                </div>
              )}

              {answerState === "correct" && (
                <div className="text-emerald-400 font-bold font-cinzel text-base md:text-lg animate-bounce flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                  Sahi Jawab! Badhaai Ho!
                </div>
              )}

              {answerState === "wrong" && (
                <div className="text-red-400 font-bold font-cinzel text-base md:text-lg">
                  Afsos! Galat Jawab!
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT: PRIZE LADDER (4 Cols on LG, overlay modal on mobile) */}
        <div className="hidden lg:block lg:col-span-4 h-full">
          <PrizeLadder
            currentQuestionIndex={currentIndex}
            currentEarnings={currentEarnings}
          />
        </div>
      </div>

      {/* MOBILE DRAWER / MODAL FOR PRIZE LADDER */}
      {showMobileLadder && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex flex-col justify-center">
          <div className="max-h-[85vh] flex flex-col">
            <div className="flex justify-end pb-2">
              <button
                onClick={() => setShowMobileLadder(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold border border-slate-700"
              >
                Close Ladder ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PrizeLadder
                currentQuestionIndex={currentIndex}
                currentEarnings={currentEarnings}
              />
            </div>
          </div>
        </div>
      )}

      {/* MULTIPURPOSE KBC MODAL */}
      <Modal
        isOpen={modalState.isOpen}
        type={modalState.type}
        data={modalState.data}
        onClose={() => setModalState({ isOpen: false, type: null, data: null })}
        onConfirmQuit={handleConfirmQuit}
        onRestart={handleRestart}
        isRestarting={isRestarting}
        onViewCheque={() => {
          const finalAmt = modalState.data?.finalPrizeAmount || 0;
          triggerPrizeCheque(
            finalAmt,
            modalState.data?.isJackpot || false,
            modalState.data?.isQuit || false
          );
        }}
      />

      {/* REALISTIC ANIMATED KBC PRIZE CHEQUE MODAL */}
      <PrizeCheque
        isOpen={showCheque}
        winnerName={playerName}
        amount={chequePrizeAmount}
        isJackpot={chequeIsJackpot}
        isQuit={chequeIsQuit}
        onClose={() => setShowCheque(false)}
        onRestart={handleRestart}
        isRestarting={isRestarting}
      />
    </div>
  );
}
