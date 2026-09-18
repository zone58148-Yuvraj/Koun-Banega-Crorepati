# KBC Quiz Game

An interactive, KBC-inspired quiz web application built with **React**, **Vite**, and **Tailwind CSS**. Players answer 17 progressively challenging questions, use lifelines, select Hindi or English, and compete for a virtual top prize of **₹7 Crore**.

> This is an unofficial fan-made quiz project. It is not affiliated with, endorsed by, or sponsored by Sony, Kaun Banega Crorepati, or Amitabh Bachchan. Use original branding, music, artwork, and names before any public or commercial release.

## Highlights

- 17-question prize ladder from ₹1,000 to ₹7 Crore
- Progressive difficulty: easy → medium → hard
- Hindi and English language selection before a game
- Fresh questions using Open Trivia Database (OpenTDB)
- Hindi translation flow using Gemini API integration
- Text-to-speech support for reading questions aloud
- Timers: 45 seconds for Q1–Q5, 60 seconds for Q6–Q10, and unlimited time afterward
- Four lifelines: Audience Poll, 50:50, Ask the Expert, and Flip the Question
- Lifelines are disabled for the final ₹7 Crore question
- Prize milestones / padav guarantee
- Quit confirmation and a premium prize-cheque result screen
- Winner/game-over screen and “Play Again” flow
- Responsive KBC-inspired blue, gold, and purple interface

## Prize Ladder

| Question | Prize | Status |
|---:|---:|---|
| Q1 | ₹1,000 | |
| Q2 | ₹2,000 | |
| Q3 | ₹3,000 | |
| Q4 | ₹5,000 | |
| Q5 | ₹10,000 | First Padav |
| Q6 | ₹20,000 | |
| Q7 | ₹40,000 | |
| Q8 | ₹80,000 | |
| Q9 | ₹1,60,000 | |
| Q10 | ₹3,20,000 | Second Padav |
| Q11 | ₹6,40,000 | |
| Q12 | ₹12,50,000 | |
| Q13 | ₹25,00,000 | |
| Q14 | ₹50,00,000 | |
| Q15 | ₹75,00,000 | Third Padav |
| Q16 | ₹1 Crore | |
| Q17 | ₹7 Crore | Final Question |

## Game Rules

### Timers

- **Q1–Q5:** 45 seconds per question
- **Q6–Q10:** 60 seconds per question
- **Q11–Q17:** No timer
- Time-out ends the game.

### Lifelines

Each lifeline can be used once in one game:

1. **Audience Poll** — displays a simulated audience percentage split.
2. **50:50** — removes two incorrect options.
3. **Ask the Expert** — shows an expert recommendation.
4. **Flip the Question** — replaces the current question with one related to the player’s selected interest.

For the final **₹7 Crore (Q17)** question, all lifelines remain visible but are disabled.

### Prize Guarantee

The game follows milestone-based guaranteed winnings:

- Before clearing Q5: ₹0 guaranteed
- After clearing Q5: ₹10,000 guaranteed
- After clearing Q10: ₹3,20,000 guaranteed
- After clearing Q15: ₹75,00,000 guaranteed

A player can quit at any time and receive the eligible amount according to the game’s implemented prize rules.

## Questions and Languages

### English mode

English questions are fetched directly from [Open Trivia Database](https://opentdb.com/).

### Hindi mode

1. Questions are fetched from OpenTDB.
2. The selected questions are translated into simple Hindi through the Gemini API integration.
3. The translated questions are shown in Hindi and can be read aloud with browser text-to-speech.

The game focuses on quiz-friendly categories such as:

- General Knowledge
- Bollywood / Indian cinema
- Indian History
- Games and Sports
- Blood-relation reasoning

## Tech Stack

- **React**
- **Vite**
- **Tailwind CSS**
- **OpenTDB API** for trivia questions
- **Gemini API** for Hindi translation / generated category questions where configured
- **Web Speech API** for text-to-speech
- **HTML5 Audio** for game music and sound effects
- **localStorage** for session token, used-question tracking, and local game data

## Local Setup

### Prerequisites

- Node.js 18 or later
- npm or another Node package manager
- A Gemini API key if Hindi translation is enabled

### Installation

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Environment Variables

If the Hindi translation feature uses Gemini, create a `.env` file in the project root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Then access it in Vite through:

```js
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

**Never commit your `.env` file or API key to GitHub.** Add this to `.gitignore`:

```gitignore
.env
.env.local
```

## OpenTDB Notes

- OpenTDB is a free public trivia API and does not require an API key.
- The app can use an OpenTDB session token and localStorage-based question history to reduce repeated questions.
- Public APIs can rate-limit requests or occasionally have unavailable categories. The app should show a proper loading/retry state when that happens.

## Deployment

This project can be deployed on Vercel, Netlify, or any static-hosting service that supports Vite applications.

For Vercel:

```bash
npm run build
```

Upload/import the repository into Vercel and add `VITE_GEMINI_API_KEY` in the project environment variables if Hindi translation is enabled.

## Important Security Note

A `VITE_` environment variable is bundled into the browser during the build. That means a Gemini key used directly from a frontend app may be exposed to visitors. For a real public launch, move Gemini calls to a protected backend/serverless function and keep the API key on the server.

## Roadmap

- Offline question packs
- Player profiles and game history
- Leaderboard
- Better source validation for all questions
- PWA/mobile installation support
- Protected backend for API calls
- Original sound, brand, and visual assets

## Disclaimer

This project is intended for learning, entertainment, and portfolio use. “KBC”, “Kaun Banega Crorepati”, associated program branding, theme music, and personalities may be protected trademarks, copyrights, or publicity rights. Do not use official logos, original theme music, celebrity names/signatures, or official-looking materials without appropriate permission for a public/commercial version.

---

Made with React and a love for quiz games.
