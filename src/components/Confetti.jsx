import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function Confetti({ trigger, isJackpot = false }) {
  useEffect(() => {
    if (!trigger) return;

    if (isJackpot) {
      // Massive celebratory continuous fireworks for ₹1 Crore & ₹7 Crore
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 },
          colors: ['#f59e0b', '#fef08a', '#10b981', '#38bdf8', '#ec4899', '#ffffff']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 },
          colors: ['#f59e0b', '#fef08a', '#10b981', '#38bdf8', '#ec4899', '#ffffff']
        });
      }, 250);

      return () => clearInterval(interval);
    } else {
      // Milestone celebration burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fef08a', '#10b981', '#ffffff']
      });
    }
  }, [trigger, isJackpot]);

  return null;
}
