import { prefersReducedMotion } from './primaryCta.js';

const BRAND_CONFETTI = ['#ffd400', '#ffec7a', '#ffffff', '#ffda1a', '#745500'];

// One short burst from the success badge. The library is loaded only on success,
// and nothing runs when the visitor prefers reduced motion.
export const celebrate = async (element, windowObject = globalThis.window) => {
  if (!windowObject || prefersReducedMotion(windowObject)) return false;

  try {
    const { default: confetti } = await import('canvas-confetti');
    const rect = element?.getBoundingClientRect?.();
    const origin = rect && windowObject.innerWidth && windowObject.innerHeight
      ? {
        x: (rect.left + rect.width / 2) / windowObject.innerWidth,
        y: (rect.top + rect.height / 2) / windowObject.innerHeight,
      }
      : { x: 0.5, y: 0.35 };

    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 36,
      gravity: 0.9,
      ticks: 160,
      scalar: 0.9,
      origin,
      colors: BRAND_CONFETTI,
      disableForReducedMotion: true,
      zIndex: 60,
    });
    return true;
  } catch {
    return false;
  }
};
