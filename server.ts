import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy Gemini client getter
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Models for translation with fallback order
// Prioritize gemini-3.1-flash-lite for high throughput, fast response times, and resilience against 503 spikes
const CANDIDATE_TRANSLATION_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.1-pro-preview",
];

/**
 * Executes Gemini content generation with multi-model fallback.
 * Handles temporary 503 high demand spikes and rate limits seamlessly by cascading to available models.
 */
async function generateTranslationWithFallback(ai: GoogleGenAI, prompt: string, extraConfig?: any): Promise<string> {
  let lastError: any = null;

  for (const model of CANDIDATE_TRANSLATION_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          ...(extraConfig || {}),
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      // On error (such as 503 high demand or 429 quota), seamlessly transition to the next candidate model
      continue;
    }
  }

  throw lastError || new Error("All Gemini translation models temporarily unavailable");
}

/**
 * POST /api/generate-questions
 * Generates category-specific questions (especially Blood Relation, Indian History, Bollywood)
 * at specified difficulty levels with options and correct answer.
 * Supports batch generation via `difficulties: string[]` or single `difficulty: string`.
 */
app.post("/api/generate-questions", async (req, res) => {
  const { category, difficulty = "easy", count = 1, difficulties, avoidQuestions = [] } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  try {
    const ai = getGeminiClient();

    const isBatchDiff = Array.isArray(difficulties) && difficulties.length > 0;
    const effectiveCount = isBatchDiff ? difficulties.length : (count || 1);

    const avoidListText = Array.isArray(avoidQuestions) && avoidQuestions.length > 0
      ? `Do NOT reuse or repeat any of these questions:\n- ${avoidQuestions.slice(-20).join("\n- ")}`
      : "";

    const difficultyInstruction = isBatchDiff
      ? `Generate exactly ${effectiveCount} questions for category "${category}", one for each assigned difficulty in this exact order:\n${difficulties.map((d: string, i: number) => `Question ${i + 1}: difficulty "${d}"`).join("\n")}`
      : `Generate exactly ${effectiveCount} question(s) for category "${category}" at difficulty "${difficulty}".`;

    const prompt = `You are the chief question curator for "Kaun Banega Crorepati" (KBC).
${difficultyInstruction}

CRITICAL REQUIREMENTS:
- Category: "${category}" (Allowed: "Bollywood", "General Knowledge", "Blood Relation", "Indian History", "Games and Sports")
  * If "Blood Relation": create a logical aptitude/reasoning question based on family relationships (e.g., "Pointing to a man, a woman said...", "A is the brother of B..."). Must be solvable with unambiguous logical deduction.
  * If "Indian History": focus on ancient, medieval, modern Indian history, freedom struggle, Indian dynasties, historic monuments, or the Indian Constitution.
  * If "Bollywood": focus on Hindi cinema, classic & modern Bollywood films, iconic dialogues, directors, playback singers, Filmfare/National Film Awards, or actors.
  * If "Games and Sports": focus on Cricket, Olympics, Hockey, Badminton, Chess, Kabaddi, Football, etc.
  * If "General Knowledge": interesting, educational Indian & world trivia, science, geography, or civics.
- Difficulty Levels:
  * "easy": accessible, friendly, straightforward (Q1-Q5 level)
  * "medium": requires good general awareness (Q6-Q10 level)
  * "medium-hard": requires sharp memory or deduction (Q11-Q13 level)
  * "hard": deep, specialized knowledge (Q14-Q16 level)
  * "hardest": Grand finale level (Q17 level - highest stakes, challenging but strictly fair and verified fact)
- Format:
  * Each question must have exactly 4 options.
  * Exactly one option must be the strictly correct answer.
  * "correctAnswer" MUST be identical to one of the 4 options.
  * Shuffle the placement of the correct answer naturally.
${avoidListText}

Return a valid JSON array of objects with the exact schema:
[
  {
    "question": "Question text in English?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "Option 1",
    "category": "${category}",
    "difficulty": "${isBatchDiff ? difficulties[0] : difficulty}"
  }
]
`;

    const responseText = await generateTranslationWithFallback(ai, prompt, {
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctAnswer: { type: Type.STRING },
            category: { type: Type.STRING },
            difficulty: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer", "category", "difficulty"],
        },
      },
    });

    let parsedQuestions: any[] = [];
    try {
      parsedQuestions = JSON.parse(responseText);
    } catch (parseErr) {
      const match = responseText.match(/\[.*\]/s);
      if (match) {
        parsedQuestions = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse JSON response from Gemini API");
      }
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error("No questions were generated");
    }

    // Validate and clean each question
    const cleanedQuestions = parsedQuestions.map((q, idx) => {
      const question = (q.question || "").trim();
      let options = Array.isArray(q.options) ? q.options.map((o: any) => String(o).trim()) : [];
      let correctAnswer = String(q.correctAnswer || "").trim();

      // Ensure 4 options and valid correctAnswer
      if (!options.includes(correctAnswer)) {
        if (options.length > 0) {
          options[0] = correctAnswer;
        } else {
          options = [correctAnswer, "Option B", "Option C", "Option D"];
        }
      }
      while (options.length < 4) {
        options.push(`Option ${String.fromCharCode(65 + options.length)}`);
      }
      options = options.slice(0, 4);

      const assignedDiff = isBatchDiff && difficulties[idx] ? difficulties[idx] : (q.difficulty || difficulty);

      return {
        question,
        options,
        correctAnswer,
        category: category,
        difficulty: assignedDiff,
      };
    });

    return res.json({
      success: true,
      questions: cleanedQuestions,
    });
  } catch (error: any) {
    // Graceful fallback to curated questions if AI generation is temporarily unavailable
    return res.json({
      success: false,
      questions: [],
      error: "AI generation busy, using curated fallback",
    });
  }
});

/**
 * POST /api/translate-hindi
 * Translates a batch of trivia questions to conversational Hindi.
 * Keeps options and answers in English.
 */
app.post("/api/translate-hindi", async (req, res) => {
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "Questions array is required" });
  }

  try {
    const ai = getGeminiClient();

    // Prepare payload of questions to translate
    const questionsToTranslate = questions.map((q, idx) => ({
      index: idx,
      question: q.question,
    }));

    const prompt = `You are an expert translator for the Indian television quiz show "Kaun Banega Crorepati" (KBC).
Translate the following trivia question texts into natural, clear, polite, and authentic Hindi (Devanagari script) suitable for Amitabh Bachchan's style on KBC.

CRITICAL RULES:
1. Translate ONLY the "question" text into Hindi (Devanagari script).
2. Do NOT translate proper nouns awkwardly (keep common names recognizable in Hindi, e.g. "पेरिस", "माउंट एवरेस्ट", "अल्बर्ट आइंस्टीन").
3. Return a valid JSON array of objects with "index" and "translatedQuestion".
4. Ensure the output strictly matches the JSON structure without extra markdown or commentary.

Input questions:
${JSON.stringify(questionsToTranslate, null, 2)}
`;

    const responseText = await generateTranslationWithFallback(ai, prompt, {
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            index: { type: Type.INTEGER },
            translatedQuestion: { type: Type.STRING },
          },
          required: ["index", "translatedQuestion"],
        },
      },
    });

    let translatedArray = [];
    try {
      translatedArray = JSON.parse(responseText);
    } catch (parseErr) {
      const match = responseText.match(/\[.*\]/s);
      if (match) {
        translatedArray = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid translation response structure from Gemini API");
      }
    }

    // Map back into the question list
    const translationMap = new Map();
    if (Array.isArray(translatedArray)) {
      translatedArray.forEach((item) => {
        if (typeof item.index === "number" && item.translatedQuestion) {
          translationMap.set(item.index, item.translatedQuestion);
        }
      });
    }

    const translatedQuestions = questions.map((q, idx) => {
      const hindiText = translationMap.get(idx);
      return {
        ...q,
        question: hindiText && hindiText.trim() ? hindiText.trim() : q.question,
        originalEnglishQuestion: q.question,
        language: "hi",
      };
    });

    return res.json({
      success: true,
      translatedQuestions,
    });
  } catch (error: any) {
    console.warn("Translation service encountered temporary issue, gracefully preserving questions in English:", error?.message);
    
    // Graceful degradation: Return original questions in English so user can play immediately without disruption
    const fallbackQuestions = questions.map((q) => ({
      ...q,
      originalEnglishQuestion: q.question,
      language: "en",
      translationFallback: true,
    }));

    return res.json({
      success: true,
      translatedQuestions: fallbackQuestions,
      fallbackNotice: "High demand, playing in English",
    });
  }
});

// Vite middleware for development vs Production static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KBC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
