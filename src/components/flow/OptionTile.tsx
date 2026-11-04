'use client';

import { AnimatePresence, motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" width={14} height={14} aria-hidden className={className}>
      <path
        d="M2.92 7l2.33 2.33L11.08 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The check pops in when a tile becomes the selected one. */
export function Check({ className }: { className?: string }) {
  const { reduced } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      <motion.span
        key="check"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={
          reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 520, damping: 22 }
        }
        className={`inline-flex shrink-0 ${className ?? ''}`}
      >
        <CheckIcon />
      </motion.span>
    </AnimatePresence>
  );
}

/**
 * A selectable tile in the purchase flow. `variant` switches between the
 * bottom-sheet styling (frames 463:936 / 463:157) and the desktop modal
 * styling (frames 463:247 / 467:449).
 */
export function OptionTile({
  selected,
  onSelect,
  children,
  label,
  className = '',
  variant = 'sheet',
  disabled = false,
}: {
  /** Shown but not selectable (e.g. an out-of-stock storage tier). */
  disabled?: boolean;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  label: string;
  className?: string;
  variant?: 'sheet' | 'modal';
}) {
  const { reduced } = useMotionPrefs();

  const base =
    variant === 'sheet'
      ? selected
        ? 'border-2 border-pink bg-pink/[0.08]'
        : 'border border-line-2 bg-card'
      : selected
        ? 'border-[1.5px] border-pink bg-modal-tile-on'
        : 'border border-modal-tile-line bg-modal-tile';

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      whileTap={reduced || disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: EASE }}
      className={`flex min-h-11 items-center justify-center rounded-2xl transition-colors duration-200 ease-quint ${base} ${
        disabled ? 'cursor-not-allowed opacity-45' : ''
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
