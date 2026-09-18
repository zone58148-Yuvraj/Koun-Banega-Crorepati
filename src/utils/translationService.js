/**
 * Service to handle Hindi translation for KBC questions via Gemini API.
 * Features:
 * - LocalStorage caching of translated questions for instant subsequent loads
 * - Parallel batch translation (Batch 1: Q1-Q10, Batch 2: Q11-Q17) to minimize latency
 * - Retains options, correct answer, category, and difficulty exactly unchanged
 * - Graceful fallback to English if Gemini API is temporarily busy
 */

const CACHE_KEY_PREFIX = "kbc_hindi_translated_q_";
const isDev = process.env.NODE_ENV !== "production";

/**
 * Creates a unique deterministic hash / key for a question to enable caching
 */
function getQuestionKey(questionText) {
  if (!questionText) return "empty";
  let hash = 0;
  const str = questionText.trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return `q_${Math.abs(hash)}`;
}

/**
 * Retrieves a translated question from localStorage if available
 */
export function getCachedTranslation(questionText) {
  try {
    const key = CACHE_KEY_PREFIX + getQuestionKey(questionText);
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Error reading translation cache:", e);
  }
  return null;
}

/**
 * Saves a translated question to localStorage cache
 */
export function saveTranslationToCache(originalText, translatedText) {
  try {
    const key = CACHE_KEY_PREFIX + getQuestionKey(originalText);
    localStorage.setItem(
      key,
      JSON.stringify({
        original: originalText,
        translated: translatedText,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.warn("Error writing translation to cache:", e);
  }
}

/**
 * Helper to translate a single chunk of questions via /api/translate-hindi
 */
async function translateBatchChunk(chunkEntries) {
  if (!chunkEntries || chunkEntries.length === 0) return [];

  const payload = chunkEntries.map((entry) => ({
    index: entry.originalIndex,
    question: entry.item.question,
  }));

  try {
    const response = await fetch("/api/translate-hindi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questions: payload }),
    });

    if (!response.ok) {
      throw new Error(`Translation API HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.translatedQuestions)) {
      return data.translatedQuestions;
    }
  } catch (err) {
    if (isDev) {
      console.warn("Translation batch failed, using English fallback:", err);
    }
  }

  return [];
}

/**
 * Translates the 17 finalized English questions into Hindi.
 * Splits into at most 2 parallel batches (Q1-Q10 and Q11-Q17) executed concurrently via Promise.all.
 *
 * @param {Array<Object>} englishQuestions 17 finalized questions
 * @param {Function} [onProgress] Optional callback for tracking progress
 * @returns {Promise<Array<Object>>} Questions with translated Hindi question text and untouched English options
 */
export async function translateQuestionsToHindi(englishQuestions, onProgress) {
  if (!Array.isArray(englishQuestions) || englishQuestions.length === 0) {
    return [];
  }

  const startTime = performance.now();
  const resultQuestions = [...englishQuestions];

  // Step 1: Check localStorage cache first
  const uncachedBatch1 = []; // Questions 1-10 (indices 0..9)
  const uncachedBatch2 = []; // Questions 11-17 (indices 10..16)

  resultQuestions.forEach((q, index) => {
    const cached = getCachedTranslation(q.question);
    if (cached && cached.translated) {
      resultQuestions[index] = {
        ...q,
        question: cached.translated,
        originalEnglishQuestion: q.question,
        language: "hi",
        fromCache: true,
      };
    } else {
      const entry = { item: q, originalIndex: index };
      if (index < 10) {
        uncachedBatch1.push(entry);
      } else {
        uncachedBatch2.push(entry);
      }
    }
  });

  const totalNeeding = uncachedBatch1.length + uncachedBatch2.length;

  // If all questions are already cached, return immediately
  if (totalNeeding === 0) {
    if (isDev) {
      console.log(`[KBC Perf] Hindi translation all 17 questions served from cache in ${(performance.now() - startTime).toFixed(1)}ms`);
    }
    if (onProgress) onProgress(100);
    return resultQuestions;
  }

  if (onProgress) {
    onProgress(50);
  }

  // Step 2: Execute at most 2 batches simultaneously using Promise.all
  const promises = [];
  if (uncachedBatch1.length > 0) {
    promises.push(translateBatchChunk(uncachedBatch1));
  } else {
    promises.push(Promise.resolve([]));
  }

  if (uncachedBatch2.length > 0) {
    promises.push(translateBatchChunk(uncachedBatch2));
  } else {
    promises.push(Promise.resolve([]));
  }

  const [batch1Results, batch2Results] = await Promise.all(promises);

  // Apply translations from both batches
  const applyTranslations = (translatedList, chunkEntries) => {
    const map = new Map();
    translatedList.forEach((t) => {
      if (typeof t.index === "number" && t.question) {
        map.set(t.index, t.question);
      }
    });

    chunkEntries.forEach(({ item, originalIndex }) => {
      const translatedText = map.get(originalIndex);
      if (translatedText && translatedText.trim()) {
        resultQuestions[originalIndex] = {
          ...item,
          question: translatedText.trim(),
          originalEnglishQuestion: item.question,
          language: "hi",
        };
        saveTranslationToCache(item.question, translatedText.trim());
      } else {
        // Fallback: keep original English so game can continue
        resultQuestions[originalIndex] = {
          ...item,
          originalEnglishQuestion: item.question,
          language: "hi",
          translationFallback: true,
        };
      }
    });
  };

  applyTranslations(batch1Results, uncachedBatch1);
  applyTranslations(batch2Results, uncachedBatch2);

  if (onProgress) onProgress(100);

  if (isDev) {
    const elapsed = (performance.now() - startTime).toFixed(1);
    console.log(`[KBC Perf] Hindi translation (2 parallel batches: ${uncachedBatch1.length} + ${uncachedBatch2.length} Qs) took ${elapsed}ms`);
  }

  return resultQuestions;
}

