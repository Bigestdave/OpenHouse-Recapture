// Centralized motion variants — restrained, cinematic, transform + opacity only.
// Inspired by Linear / Vercel / Apple product pages.

import type { Variants, Transition } from "motion/react";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

export const revealImage: Variants = {
  hidden: { opacity: 0, scale: 0.985, y: 32 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

export const heroReveal: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

// Stagger container: children reveal in sequence with a gentle offset.
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

export const crossfade: Transition = { duration: 0.5, ease: EASE_OUT };

export { EASE_OUT };
