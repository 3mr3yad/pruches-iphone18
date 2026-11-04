import type { Transition, Variants } from 'motion/react';

/** ease-out-quint — the single easing used across the page. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DUR = {
  micro: 0.2,
  reveal: 0.5,
  revealSlow: 0.6,
} as const;

export const SHEET_SPRING: Transition = { type: 'spring', stiffness: 380, damping: 36 };

export const microT: Transition = { duration: DUR.micro, ease: EASE };
export const revealT: Transition = { duration: DUR.reveal, ease: EASE };

/** Replaces every slide/scale with a flat 150 ms fade. */
export const reducedT: Transition = { duration: 0.15, ease: 'linear' };

/** Fade-up 24px. Children of a `staggerParent`. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: revealT },
};

/** Hero items: fade-up 20px. */
export const fadeUpHero: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: revealT },
};

export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Line-mask reveal for the H1. */
export const lineMask: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
  show: {
    clipPath: 'inset(0 0 0% 0)',
    opacity: 1,
    transition: { duration: DUR.revealSlow, ease: EASE },
  },
};

/**
 * The reduced-motion stand-in for every reveal variant.
 *
 * `useReducedMotion` only resolves after mount, so an element can render once
 * with `fadeUp`/`lineMask` and then swap to this set. Any property the other
 * variants animate has to be named here as well — otherwise motion keeps the
 * value it last applied and the element stays offset by 24px (or clipped).
 */
export const flat: Variants = {
  hidden: { opacity: 0, x: 0, y: 0, scale: 1, clipPath: 'inset(0 0 0% 0)' },
  show: { opacity: 1, x: 0, y: 0, scale: 1, clipPath: 'inset(0 0 0% 0)', transition: reducedT },
};

export const flatParent: Variants = { hidden: {}, show: {} };

/** Shared viewport config for in-view reveals: once, at ~20% visibility. */
export const inView = { once: true, amount: 0.2 } as const;

/** Modal backdrop. */
export const backdrop: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.micro, ease: EASE } },
  exit: { opacity: 0, transition: { duration: DUR.micro, ease: EASE } },
};

/** Desktop modal panel: fade + scale 0.96 → 1. */
export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: DUR.micro, ease: EASE } },
};

/**
 * Step transition. In RTL the forward direction is leftwards, so a new
 * forward step enters from the left (negative x) and «رجوع» reverses it.
 */
export const stepSlide = (dir: 1 | -1) => ({
  hidden: { opacity: 0, x: dir === 1 ? -40 : 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE } },
  exit: { opacity: 0, x: dir === 1 ? 40 : -40, transition: { duration: 0.2, ease: EASE } },
});
