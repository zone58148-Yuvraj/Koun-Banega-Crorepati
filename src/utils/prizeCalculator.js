// Prize structure for Kaun Banega Crorepati (17 Questions)
export const PRIZE_LADDER = [
  { level: 1, amount: 1000, formatted: "₹1,000", isMilestone: false },
  { level: 2, amount: 2000, formatted: "₹2,000", isMilestone: false },
  { level: 3, amount: 3000, formatted: "₹3,000", isMilestone: false },
  { level: 4, amount: 5000, formatted: "₹5,000", isMilestone: false },
  { level: 5, amount: 10000, formatted: "₹10,000", isMilestone: true, milestoneNumber: 1 },
  { level: 6, amount: 20000, formatted: "₹20,000", isMilestone: false },
  { level: 7, amount: 40000, formatted: "₹40,000", isMilestone: false },
  { level: 8, amount: 80000, formatted: "₹80,000", isMilestone: false },
  { level: 9, amount: 160000, formatted: "₹1,60,000", isMilestone: false },
  { level: 10, amount: 320000, formatted: "₹3,20,000", isMilestone: true, milestoneNumber: 2 },
  { level: 11, amount: 640000, formatted: "₹6,40,000", isMilestone: false },
  { level: 12, amount: 1250000, formatted: "₹12,50,000", isMilestone: false },
  { level: 13, amount: 2500000, formatted: "₹25,00,000", isMilestone: false },
  { level: 14, amount: 5000000, formatted: "₹50,00,000", isMilestone: false },
  { level: 15, amount: 7500000, formatted: "₹75,00,000", isMilestone: true, milestoneNumber: 3 },
  { level: 16, amount: 10000000, formatted: "₹1 Crore", isMilestone: false },
  { level: 17, amount: 70000000, formatted: "₹7 Crore", isMilestone: true, milestoneNumber: 4, isJackpot: true }
];

/**
 * Calculates guaranteed milestone prize when a player gives a wrong answer at a given question index (0 to 16).
 * Milestone thresholds:
 * - Before Q5 (index < 4): ₹0
 * - After Q5 (index >= 5, i.e., player cleared Q5): ₹10,000
 * - After Q10 (index >= 10, i.e., player cleared Q10): ₹3,20,000
 * - After Q15 (index >= 15, i.e., player cleared Q15): ₹75,00,000
 *
 * @param {number} questionIndex - 0-based index of current question (0 = Q1, 16 = Q17)
 * @returns {{ amount: number, formatted: string }}
 */
export function calculatePrize(questionIndex) {
  // If player fails before completing Q5 (i.e. Q1 through Q5)
  if (questionIndex < 4) {
    return { amount: 0, formatted: "₹0" };
  }
  
  // If player fails on Q5 (index 4), they haven't completed Q5 yet
  if (questionIndex === 4) {
    return { amount: 0, formatted: "₹0" };
  }

  // If player cleared Q5 (index >= 5) but hasn't cleared Q10 (index <= 9)
  if (questionIndex >= 5 && questionIndex <= 9) {
    return { amount: 10000, formatted: "₹10,000" };
  }

  // If player cleared Q10 (index >= 10) but hasn't cleared Q15 (index <= 14)
  if (questionIndex >= 10 && questionIndex <= 14) {
    return { amount: 320000, formatted: "₹3,20,000" };
  }

  // If player cleared Q15 (index >= 15)
  if (questionIndex >= 15) {
    return { amount: 7500000, formatted: "₹75,00,000" };
  }

  return { amount: 0, formatted: "₹0" };
}

/**
 * Returns the prize value won so far for the last correctly answered question.
 * @param {number} currentQuestionIndex - 0-based index of current question
 * @returns {{ amount: number, formatted: string }}
 */
export function getWonPrize(currentQuestionIndex) {
  if (currentQuestionIndex <= 0) {
    return { amount: 0, formatted: "₹0" };
  }
  const completedIndex = currentQuestionIndex - 1;
  const tier = PRIZE_LADDER[completedIndex];
  if (!tier) {
    return { amount: 0, formatted: "₹0" };
  }
  return { amount: tier.amount, formatted: tier.formatted };
}

/**
 * Formats numbers into Indian Lakhs / Crores or standard thousands.
 * @param {number} amount
 * @returns {string}
 */
export function formatPrizeAmount(amount) {
  if (amount === 0) return "₹0";
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `₹${crore} Crore`;
  }
  if (amount >= 100000) {
    const lakh = (amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2);
    return `₹${lakh} Lakh`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}
