'use client';

import { useReducedMotion } from 'motion/react';

/**
 * One place to ask "should this animate?". `motion` already tracks the media
 * query; this just gives the rest of the app a positive-sense flag plus the
 * variant/transition swap used for reduced motion.
 */
export function useMotionPrefs() {
  const reduced = useReducedMotion() ?? false;
  return { reduced, animate: !reduced };
}
