'use client';

import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

/**
 * Primary pink CTA (Figma component 425:4). 52px tall on mobile, 64px from lg.
 * RTL: the arrow sits at the end of the row, which is the left in RTL, and
 * nudges 4px further left on hover.
 */
type Props = {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  showArrow?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'md' | 'lg';
  variant?: 'pink' | 'white';
  type?: 'button' | 'submit';
  'aria-haspopup'?: 'dialog';
  'aria-expanded'?: boolean;
};

const ArrowLeft = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 18 18"
    aria-hidden="true"
    focusable="false"
    className={className}
    width={18}
    height={18}
  >
    <path
      d="M15 9H3M3 9l5.25-5.25M3 9l5.25 5.25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    children,
    onClick,
    showArrow = true,
    disabled = false,
    className = '',
    size = 'md',
    variant = 'pink',
    type = 'button',
    ...aria
  },
  ref,
) {
  const { animate } = useMotionPrefs();

  const palette =
    variant === 'pink'
      ? 'bg-pink text-on-pink shadow-cta'
      : 'bg-white text-[#050505] shadow-[0px_10px_12px_0px_rgba(0,0,0,0.25)]';

  const height = size === 'lg' ? 'h-[52px] lg:h-16' : 'h-[52px]';
  const text = size === 'lg' ? 'text-base lg:text-[22px]' : 'text-base lg:text-[18px]';

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={animate && !disabled ? { filter: 'brightness(1.06)' } : undefined}
      whileTap={animate && !disabled ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.2, ease: EASE }}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-pill font-bold outline-offset-2 transition-[opacity,filter] duration-200 ease-quint disabled:cursor-not-allowed disabled:opacity-50 ${palette} ${height} ${text} ${className}`}
      {...aria}
    >
      {/* RTL: the label leads, the arrow sits at the end — the left (Figma 425:4). */}
      <span className="whitespace-nowrap">{children}</span>
      {showArrow ? (
        <ArrowLeft className="shrink-0 transition-transform duration-200 ease-quint motion-safe:group-hover:-translate-x-1" />
      ) : null}
    </motion.button>
  );
});
