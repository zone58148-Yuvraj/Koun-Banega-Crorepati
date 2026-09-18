/**
 * Utility to convert numbers into Indian numbering system currency words.
 * Formats values into "X Crore Y Lakh Z Thousand Rupees Only".
 * Handles range from 0 up to 10 Crore+ accurately.
 *
 * Examples:
 * 70000000 -> "Seven Crore Rupees Only"
 * 320000 -> "Three Lakh Twenty Thousand Rupees Only"
 * 10000 -> "Ten Thousand Rupees Only"
 * 1000 -> "One Thousand Rupees Only"
 * 0 -> "Zero Rupees Only"
 */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function twoDigitsToWords(n) {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const rem = n % 10;
  return `${TENS[ten]}${rem ? " " + ONES[rem] : ""}`.trim();
}

function threeDigitsToWords(n) {
  const hundred = Math.floor(n / 100);
  const remainder = n % 100;
  const parts = [];
  if (hundred > 0) {
    parts.push(`${ONES[hundred]} Hundred`);
  }
  if (remainder > 0) {
    parts.push(twoDigitsToWords(remainder));
  }
  return parts.join(" ");
}

/**
 * Converts a numeric amount to Indian currency words format
 * @param {number} amount
 * @returns {string} e.g. "Seven Crore Rupees Only"
 */
export function numberToWords(amount) {
  const num = Math.floor(Math.abs(Number(amount) || 0));

  if (num === 0) {
    return "Zero Rupees Only";
  }

  // Indian Numbering System Breakdown:
  // - Crores: Math.floor(num / 1,00,00,000)
  // - Lakhs: Math.floor((num % 1,00,00,000) / 1,00,000)
  // - Thousands: Math.floor((num % 1,00,000) / 1,000)
  // - Hundreds & remaining: num % 1,000

  const crore = Math.floor(num / 10000000);
  const remainderCrore = num % 10000000;

  const lakh = Math.floor(remainderCrore / 100000);
  const remainderLakh = remainderCrore % 100000;

  const thousand = Math.floor(remainderLakh / 1000);
  const remainderThousand = remainderLakh % 1000;

  const words = [];

  if (crore > 0) {
    words.push(`${twoDigitsToWords(crore)} Crore`);
  }

  if (lakh > 0) {
    words.push(`${twoDigitsToWords(lakh)} Lakh`);
  }

  if (thousand > 0) {
    words.push(`${twoDigitsToWords(thousand)} Thousand`);
  }

  if (remainderThousand > 0) {
    words.push(threeDigitsToWords(remainderThousand));
  }

  return `${words.join(" ").trim()} Rupees Only`;
}

/**
 * Formats a number with Indian currency grouping (e.g., 7,00,00,000)
 * @param {number} amount
 * @returns {string} e.g. "₹ 7,00,00,000"
 */
export function formatIndianCurrency(amount) {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  const numStr = num.toString();

  if (numStr.length <= 3) {
    return `₹ ${numStr}`;
  }

  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return `₹ ${formattedOther},${lastThree}`;
}
