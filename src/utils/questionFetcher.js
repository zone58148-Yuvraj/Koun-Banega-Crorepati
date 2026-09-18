import { FALLBACK_QUESTIONS } from "../data/fallbackQuestions";
import { translateQuestionsToHindi } from "./translationService";

/**
 * Open Trivia Database (OpenTDB) & Gemini Question System for KBC
 * 
 * Strict specifications:
 * - 5 Official Categories:
 *   1. "Bollywood"
 *   2. "General Knowledge"
 *   3. "Blood Relation"
 *   4. "Indian History"
 *   5. "Games and Sports"
 * - Difficulty Progression:
 *   - Q1 to Q5: Easy
 *   - Q6 to Q10: Medium
 *   - Q11 to Q13: Medium-Hard
 *   - Q14 to Q16: Hard
 *   - Q17: Hardest but fair (Grand Finale ₹7 Crore)
 *
 * Session Token & Duplicate Protection:
 * - Persistent OpenTDB session token in localStorage (`openTdbSessionToken`)
 * - Auto-renewal on invalid/expired/empty token (`response_code: 3` or `4`)
 * - Question history in localStorage (`kbcUsedQuestionIds`, capped at latest 1,000)
 * - Normalized question ID: category + difficulty + lowercased question text
 * - Guaranteed rate-limit safety: >= 5.5s delay between OpenTDB calls, 6-10s retry on code 5
 */

export const STORAGE_KEYS = {
  SESSION_TOKEN: "openTdbSessionToken",
  USED_IDS: "kbcUsedQuestionIds",
};

export const OFFICIAL_CATEGORIES = [
  "Bollywood",
  "General Knowledge",
  "Blood Relation",
  "Indian History",
  "Games and Sports",
];

// 17 Question blueprint mapping question index (0 to 16) to difficulty and category
export const GAME_QUESTION_BLUEPRINT = [
  // Q1 - Q5: Easy
  { index: 0, questionNumber: 1, difficulty: "easy", category: "Bollywood" },
  { index: 1, questionNumber: 2, difficulty: "easy", category: "General Knowledge" },
  { index: 2, questionNumber: 3, difficulty: "easy", category: "Blood Relation" },
  { index: 3, questionNumber: 4, difficulty: "easy", category: "Games and Sports" },
  { index: 4, questionNumber: 5, difficulty: "easy", category: "Indian History" }, // Milestone 1 (₹10,000)

  // Q6 - Q10: Medium
  { index: 5, questionNumber: 6, difficulty: "medium", category: "Bollywood" },
  { index: 6, questionNumber: 7, difficulty: "medium", category: "General Knowledge" },
  { index: 7, questionNumber: 8, difficulty: "medium", category: "Blood Relation" },
  { index: 8, questionNumber: 9, difficulty: "medium", category: "Games and Sports" },
  { index: 9, questionNumber: 10, difficulty: "medium", category: "Indian History" }, // Milestone 2 (₹3,20,000)

  // Q11 - Q13: Medium-Hard
  { index: 10, questionNumber: 11, difficulty: "medium-hard", category: "Blood Relation" },
  { index: 11, questionNumber: 12, difficulty: "medium-hard", category: "Games and Sports" },
  { index: 12, questionNumber: 13, difficulty: "medium-hard", category: "Bollywood" },

  // Q14 - Q16: Hard
  { index: 13, questionNumber: 14, difficulty: "hard", category: "Indian History" },
  { index: 14, questionNumber: 15, difficulty: "hard", category: "General Knowledge" }, // Milestone 3 (₹1 Crore)
  { index: 15, questionNumber: 16, difficulty: "hard", category: "Games and Sports" },

  // Q17: Hardest but fair (Grand Finale ₹7 Crore)
  { index: 16, questionNumber: 17, difficulty: "hardest", category: "Indian History" },
];

/**
 * Normalizes question attributes into a unique persistent hash/ID:
 * category + difficulty + lowercased question text
 */
export function generateQuestionId(category, difficulty, questionText) {
  const normCat = (category || "General Knowledge").toLowerCase().trim();
  const normDiff = (difficulty || "easy").toLowerCase().trim();
  const normText = (questionText || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
  return `${normCat}__${normDiff}__${normText}`;
}

/**
 * Reads used question IDs from localStorage
 */
export function getUsedQuestionIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USED_IDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Could not parse kbcUsedQuestionIds from localStorage", e);
  }
  return [];
}

/**
 * Saves new question IDs into localStorage, preserving only the latest 1,000 IDs
 */
export function markQuestionIdsAsUsed(newIds) {
  if (!Array.isArray(newIds) || newIds.length === 0) return;
  try {
    const existing = getUsedQuestionIds();
    const combined = [...existing, ...newIds];
    const unique = Array.from(new Set(combined));
    const trimmed = unique.slice(-1000); // Keep only latest 1000
    localStorage.setItem(STORAGE_KEYS.USED_IDS, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Could not save kbcUsedQuestionIds to localStorage", e);
  }
}

/**
 * Retrieves the stored OpenTDB session token, or requests a fresh one on first app load
 */
export async function getOrInitSessionToken() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (e) {
    console.warn("Error reading openTdbSessionToken", e);
  }
  return await requestNewSessionToken();
}

/**
 * Requests a new OpenTDB session token from the official API
 */
export async function requestNewSessionToken() {
  try {
    const res = await fetch("https://opentdb.com/api_token.php?command=request", {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.response_code === 0 && data.token) {
        localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, data.token);
        return data.token;
      }
    }
  } catch (err) {
    console.warn("OpenTDB token request network error:", err);
  }
  return "";
}

// Global rate limit sequencer ensuring >= 5.5 seconds between every OpenTDB request
let lastOpenTdbTimestamp = 0;
let openTdbQueuePromise = Promise.resolve();

/**
 * Executes a function through the 5.5-second rate-limited queue
 */
export function executeRateLimitedOpenTdb(requestFn) {
  openTdbQueuePromise = openTdbQueuePromise.then(async () => {
    const now = Date.now();
    const elapsed = now - lastOpenTdbTimestamp;
    const minDelay = 5500; // 5.5 seconds
    if (elapsed < minDelay) {
      const waitMs = minDelay - elapsed;
      await new Promise((r) => setTimeout(r, waitMs));
    }
    try {
      const res = await requestFn();
      lastOpenTdbTimestamp = Date.now();
      return res;
    } catch (err) {
      lastOpenTdbTimestamp = Date.now();
      throw err;
    }
  });
  return openTdbQueuePromise;
}

// Decode HTML entities
export function decodeHtml(html) {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Shuffle array
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Normalizes OpenTDB question item
 */
function normalizeOpenTdbQuestion(item, assignedCategory = "General Knowledge", assignedDifficulty = "easy") {
  const question = decodeHtml(item.question);
  const correctAnswer = decodeHtml(item.correct_answer);
  const incorrectAnswers = (item.incorrect_answers || []).map((ans) => decodeHtml(ans));
  const options = shuffleArray([correctAnswer, ...incorrectAnswers]);

  return {
    question,
    options,
    correctAnswer,
    category: assignedCategory,
    difficulty: assignedDifficulty,
  };
}

/**
 * Fetches questions from OpenTDB with session token, rate limiting, and retry handling.
 * - Adds &token=${token}
 * - Retries if response_code: 5 (rate limit) with 6-10s delay up to 3 times
 * - Requests new token once if response_code: 3 (not found) or 4 (empty)
 */
export async function fetchOpenTdbBatch({ amount = 10, difficulty = "", categoryId = null, retryCount = 0 }) {
  return executeRateLimitedOpenTdb(async () => {
    let token = await getOrInitSessionToken();
    let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
    if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
      url += `&difficulty=${difficulty}`;
    }
    if (categoryId) {
      url += `&category=${categoryId}`;
    }
    if (token) {
      url += `&token=${token}`;
    }

    try {
      const res = await fetch(url, { cache: "no-store" });
      
      // HTTP 429 rate limit
      if (res.status === 429) {
        if (retryCount < 3) {
          const waitTime = Math.floor(Math.random() * 4000) + 6000; // 6 to 10 seconds
          console.warn(`OpenTDB 429 rate limit. Waiting ${waitTime}ms before retry ${retryCount + 1}...`);
          await new Promise((r) => setTimeout(r, waitTime));
          return await fetchOpenTdbBatch({ amount, difficulty, categoryId, retryCount: retryCount + 1 });
        }
        return [];
      }

      if (!res.ok) return [];

      const data = await res.json();

      // OpenTDB response codes:
      // 0: Success
      // 1: No Results
      // 2: Invalid Parameter
      // 3: Token Not Found -> request new token and retry once
      // 4: Token Empty -> request new token and retry once
      // 5: Rate Limit -> wait 6-10s and retry up to 3 times
      if (data.response_code === 0 && Array.isArray(data.results)) {
        return data.results;
      }

      if (data.response_code === 5) {
        if (retryCount < 3) {
          const waitTime = Math.floor(Math.random() * 4000) + 6000; // 6 to 10 seconds
          console.warn(`OpenTDB code 5 rate limit. Waiting ${waitTime}ms before retry ${retryCount + 1}...`);
          await new Promise((r) => setTimeout(r, waitTime));
          return await fetchOpenTdbBatch({ amount, difficulty, categoryId, retryCount: retryCount + 1 });
        }
        return [];
      }

      if (data.response_code === 3 || data.response_code === 4) {
        console.warn(`OpenTDB token issue (code ${data.response_code}). Requesting new token...`);
        const newToken = await requestNewSessionToken();
        if (newToken && retryCount < 1) {
          return await fetchOpenTdbBatch({ amount, difficulty, categoryId, retryCount: retryCount + 1 });
        }
      }

      return [];
    } catch (err) {
      console.warn("OpenTDB batch request failed:", err);
      return [];
    }
  });
}

/**
 * Fetches Gemini-generated questions for specific categories:
 * Blood Relation, Indian History, Bollywood, or Games and Sports.
 * Supports batch generation with `difficulties` array or single `difficulty`.
 */
export async function fetchGeminiQuestions({ category, difficulty = "easy", count = 1, difficulties = null, avoidQuestions = [] }) {
  try {
    const res = await fetch("/api/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, difficulty, count, difficulties, avoidQuestions }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Gemini question generation for category "${category}" failed:`, err);
    }
  }
  return [];
}

/**
 * Finds a suitable question from offline curated FALLBACK_QUESTIONS for a category & difficulty,
 * ensuring it has not been used in the current game or in kbcUsedQuestionIds.
 */
export function getNonDuplicateFallback(category, difficulty, currentSelectedIds = new Set(), usedIdsSet = new Set()) {
  const diffKey = difficulty === "medium-hard" ? "medium-hard" : difficulty;
  const pool = FALLBACK_QUESTIONS[diffKey] || FALLBACK_QUESTIONS[difficulty] || FALLBACK_QUESTIONS.easy;

  // First try matching category & difficulty
  const matchCategory = pool.filter((q) => q.category === category);
  for (const q of shuffleArray(matchCategory)) {
    const qId = generateQuestionId(q.category, q.difficulty, q.question);
    if (!currentSelectedIds.has(qId) && !usedIdsSet.has(qId)) {
      return { ...q };
    }
  }

  // Second try matching difficulty in any category
  for (const q of shuffleArray(pool)) {
    const qId = generateQuestionId(category, difficulty, q.question);
    if (!currentSelectedIds.has(qId) && !usedIdsSet.has(qId)) {
      return { ...q, category, difficulty };
    }
  }

  // Third try any non-duplicate in current pool
  for (const q of shuffleArray(pool)) {
    const qId = generateQuestionId(q.category, q.difficulty, q.question);
    if (!currentSelectedIds.has(qId)) {
      return { ...q, category, difficulty };
    }
  }

  // Emergency fallback
  const fallbackItem = pool[0] || FALLBACK_QUESTIONS.easy[0];
  return { ...fallbackItem, category, difficulty };
}

// In-memory cache for unused candidate questions that have not yet been played
let unusedCandidatesPool = [];

/**
 * Preloads all 17 questions before Question 1 is shown.
 * Enforces:
 * - Parallel fetching (OpenTDB and Gemini category batches concurrently)
 * - Rate limit safety (< 5.5s delay only when required)
 * - Session token persistence in localStorage
 * - Local duplicate protection (kbcUsedQuestionIds)
 * - Exact category & difficulty progression
 * - Hindi translation via 2 parallel batches (Q1-Q10 and Q11-Q17)
 */
export async function fetchQuestions(language = "en", onProgress = null) {
  const isDev = process.env.NODE_ENV !== "production";
  const totalStartTime = performance.now();

  const reportProgress = (stage, pct) => {
    if (onProgress && typeof onProgress === "function") {
      try {
        onProgress(stage, pct);
      } catch (e) {
        // ignore callback errors
      }
    }
  };

  reportProgress("Fetching questions…", 15);

  const usedIdsArray = getUsedQuestionIds();
  const usedIdsSet = new Set(usedIdsArray);
  const currentGameIds = new Set();
  const finalizedQuestions = [];

  // Step 1: Token retrieval (from localStorage or new)
  const tokenStart = performance.now();
  await getOrInitSessionToken();
  const tokenDuration = performance.now() - tokenStart;

  // Step 2: Parallel Fetching
  // Concurrently request OpenTDB and Gemini category batches
  const fetchStart = performance.now();

  const [openTdbResult, bollywoodResult, historyResult, bloodRelResult] = await Promise.allSettled([
    fetchOpenTdbBatch({ amount: 15 }),
    fetchGeminiQuestions({
      category: "Bollywood",
      difficulties: ["easy", "medium", "medium-hard", "hard"],
      avoidQuestions: Array.from(usedIdsSet).slice(-15),
    }),
    fetchGeminiQuestions({
      category: "Indian History",
      difficulties: ["easy", "medium", "medium-hard", "hard"],
      avoidQuestions: Array.from(usedIdsSet).slice(-15),
    }),
    fetchGeminiQuestions({
      category: "Blood Relation",
      difficulties: ["easy", "medium", "medium-hard"],
      avoidQuestions: Array.from(usedIdsSet).slice(-15),
    }),
  ]);

  const fetchDuration = performance.now() - fetchStart;

  let openTdbPool = openTdbResult.status === "fulfilled" && Array.isArray(openTdbResult.value) ? openTdbResult.value : [];
  let bollywoodPool = bollywoodResult.status === "fulfilled" && Array.isArray(bollywoodResult.value) ? bollywoodResult.value : [];
  let historyPool = historyResult.status === "fulfilled" && Array.isArray(historyResult.value) ? historyResult.value : [];
  let bloodRelPool = bloodRelResult.status === "fulfilled" && Array.isArray(bloodRelResult.value) ? bloodRelResult.value : [];

  reportProgress("Checking unique questions…", 55);

  const validationStart = performance.now();

  // Step 3: Assemble the 17 blueprint slots
  for (let i = 0; i < GAME_QUESTION_BLUEPRINT.length; i++) {
    const slot = GAME_QUESTION_BLUEPRINT[i];
    let selectedQuestion = null;

    // Helper to find question in a pool matching difficulty
    const findInPool = (pool) => {
      for (let p = 0; p < pool.length; p++) {
        const item = pool[p];
        const qId = generateQuestionId(slot.category, slot.difficulty, item.question);
        if (!currentGameIds.has(qId) && !usedIdsSet.has(qId)) {
          pool.splice(p, 1);
          return item;
        }
      }
      return null;
    };

    // A. Specific Gemini pools for Bollywood, Indian History, Blood Relation
    if (slot.category === "Bollywood") {
      selectedQuestion = findInPool(bollywoodPool);
    } else if (slot.category === "Indian History") {
      selectedQuestion = findInPool(historyPool);
    } else if (slot.category === "Blood Relation") {
      selectedQuestion = findInPool(bloodRelPool);
    }

    // B. For General Knowledge or Games and Sports, check OpenTDB pool
    if (!selectedQuestion && (slot.category === "General Knowledge" || slot.category === "Games and Sports")) {
      const categoryFilter = slot.category === "Games and Sports"
        ? (item) => item.category?.includes("Sports")
        : (item) => !item.category?.includes("Sports");

      for (let p = 0; p < openTdbPool.length; p++) {
        const item = openTdbPool[p];
        if (categoryFilter(item)) {
          const normalized = normalizeOpenTdbQuestion(item, slot.category, slot.difficulty);
          const qId = generateQuestionId(normalized.category, normalized.difficulty, normalized.question);
          if (!currentGameIds.has(qId) && !usedIdsSet.has(qId)) {
            selectedQuestion = normalized;
            openTdbPool.splice(p, 1);
            break;
          }
        }
      }
    }

    // C. Check safe unused candidates cache
    if (!selectedQuestion) {
      for (let c = 0; c < unusedCandidatesPool.length; c++) {
        const cand = unusedCandidatesPool[c];
        if (cand.category === slot.category) {
          const qId = generateQuestionId(cand.category, cand.difficulty || slot.difficulty, cand.question);
          if (!currentGameIds.has(qId) && !usedIdsSet.has(qId)) {
            selectedQuestion = { ...cand };
            unusedCandidatesPool.splice(c, 1);
            break;
          }
        }
      }
    }

    // D. Safe Fallback: Guaranteed non-duplicate question from curated pool matching category & difficulty
    if (!selectedQuestion) {
      selectedQuestion = getNonDuplicateFallback(slot.category, slot.difficulty, currentGameIds, usedIdsSet);
    }

    // Enforce blueprint metadata
    selectedQuestion.category = slot.category;
    selectedQuestion.difficulty = slot.difficulty;
    selectedQuestion.questionNumber = slot.questionNumber;

    const finalId = generateQuestionId(selectedQuestion.category, selectedQuestion.difficulty, selectedQuestion.question);
    currentGameIds.add(finalId);
    finalizedQuestions.push(selectedQuestion);
  }

  // Cache remaining unused candidate questions for subsequent games (Safe Cache Optimization)
  const remainingCandidates = [...bollywoodPool, ...historyPool, ...bloodRelPool];
  remainingCandidates.forEach((cand) => {
    if (cand && cand.question && Array.isArray(cand.options) && cand.options.length === 4) {
      const id = generateQuestionId(cand.category, cand.difficulty, cand.question);
      if (!usedIdsSet.has(id) && !currentGameIds.has(id)) {
        if (unusedCandidatesPool.length < 30) {
          unusedCandidatesPool.push(cand);
        }
      }
    }
  });

  // Step 4: Record finalized 17 question IDs to localStorage kbcUsedQuestionIds (max 1000)
  markQuestionIdsAsUsed(Array.from(currentGameIds));

  const validationDuration = performance.now() - validationStart;

  // Step 5: Hindi translation via Gemini if language is "hi"
  let hindiTransDuration = 0;
  if (language === "hi") {
    reportProgress("Translating to Hindi…", 75);
    const transStart = performance.now();
    try {
      const translated = await translateQuestionsToHindi(finalizedQuestions, (pct) => {
        reportProgress("Translating to Hindi…", 75 + Math.floor((pct || 0) * 0.2));
      });
      hindiTransDuration = performance.now() - transStart;

      reportProgress("Starting game…", 100);

      if (isDev) {
        console.log(`[KBC Perf] Token: ${tokenDuration.toFixed(1)}ms | Fetch: ${fetchDuration.toFixed(1)}ms | Validation: ${validationDuration.toFixed(1)}ms | Hindi Translation: ${hindiTransDuration.toFixed(1)}ms | Total: ${(performance.now() - totalStartTime).toFixed(1)}ms`);
      }

      return translated;
    } catch (transErr) {
      console.error("Hindi translation failed, falling back to English questions:", transErr);
      reportProgress("Starting game…", 100);
      return finalizedQuestions.map((q) => ({ ...q, language: "en" }));
    }
  }

  reportProgress("Starting game…", 100);

  if (isDev) {
    console.log(`[KBC Perf] Token: ${tokenDuration.toFixed(1)}ms | Fetch: ${fetchDuration.toFixed(1)}ms | Validation: ${validationDuration.toFixed(1)}ms | Total English Preparation: ${(performance.now() - totalStartTime).toFixed(1)}ms`);
  }

  return finalizedQuestions.map((q) => ({ ...q, language: "en" }));
}

/**
 * Fetches a single non-duplicate replacement question for the "Flip Question" lifeline.
 * Respects the 5.5-second rate-limit queue, category validity, and duplicate protection.
 *
 * @param {Object} currentQuestion
 * @param {string} language "en" | "hi"
 */
export async function fetchFlipQuestionReplacement(currentQuestion, language = "en") {
  const targetDifficulty = currentQuestion?.difficulty || "medium";
  const usedIdsArray = getUsedQuestionIds();
  const usedIdsSet = new Set(usedIdsArray);
  const currentId = generateQuestionId(currentQuestion?.category, currentQuestion?.difficulty, currentQuestion?.question);
  usedIdsSet.add(currentId);

  // Pick an alternate category from the 5 official categories
  const otherCategories = OFFICIAL_CATEGORIES.filter((c) => c !== currentQuestion?.category);
  const selectedCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)] || "General Knowledge";

  let replacement = null;

  // 1. Try Gemini generator for authentic category questions
  if (["Blood Relation", "Indian History", "Bollywood"].includes(selectedCategory)) {
    try {
      const geminiBatch = await fetchGeminiQuestions({
        category: selectedCategory,
        difficulty: targetDifficulty,
        count: 1,
        avoidQuestions: [currentQuestion?.question || ""],
      });
      if (geminiBatch && geminiBatch.length > 0) {
        const candidate = geminiBatch[0];
        const qId = generateQuestionId(candidate.category, candidate.difficulty, candidate.question);
        if (!usedIdsSet.has(qId)) {
          replacement = candidate;
        }
      }
    } catch (e) {
      console.warn("Gemini flip replacement failed:", e);
    }
  }

  // 2. Try rate-limited OpenTDB if General Knowledge or Sports
  if (!replacement && (selectedCategory === "General Knowledge" || selectedCategory === "Games and Sports")) {
    try {
      const raw = await fetchOpenTdbBatch({
        amount: 3,
        difficulty: ["easy", "medium", "hard"].includes(targetDifficulty) ? targetDifficulty : "medium",
      });
      if (Array.isArray(raw)) {
        for (const item of raw) {
          const norm = normalizeOpenTdbQuestion(item, selectedCategory, targetDifficulty);
          const qId = generateQuestionId(norm.category, norm.difficulty, norm.question);
          if (!usedIdsSet.has(qId)) {
            replacement = norm;
            break;
          }
        }
      }
    } catch (e) {
      console.warn("OpenTDB flip replacement failed:", e);
    }
  }

  // 3. Guaranteed non-duplicate fallback
  if (!replacement) {
    replacement = getNonDuplicateFallback(selectedCategory, targetDifficulty, new Set([currentId]), usedIdsSet);
  }

  replacement.category = selectedCategory;
  replacement.difficulty = targetDifficulty;

  const newId = generateQuestionId(replacement.category, replacement.difficulty, replacement.question);
  markQuestionIdsAsUsed([newId]);

  // Translate to Hindi if active language is "hi"
  if (language === "hi") {
    try {
      const translatedBatch = await translateQuestionsToHindi([replacement]);
      if (translatedBatch && translatedBatch.length > 0) {
        return translatedBatch[0];
      }
    } catch (err) {
      console.warn("Flip question translation failed:", err);
    }
  }

  return { ...replacement, language: "en" };
}
