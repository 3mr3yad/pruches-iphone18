'use client';

import { motion, type Variants } from 'motion/react';
import { fadeUp, flat, flatParent, inView, staggerParent } from '@/lib/motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

type Tag = 'div' | 'section' | 'ul' | 'li' | 'p' | 'span' | 'h2' | 'h3' | 'header' | 'footer';

/**
 * Staggers its `<RevealItem>` children into view once, at ~20% visibility.
 * Under `prefers-reduced-motion` the stagger collapses into a plain fade.
 */
export function Reveal({
  children,
  className,
  as = 'div',
  stagger = 0.08,
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  as?: Tag;
  stagger?: number;
  delay?: number;
  id?: string;
}) {
  const { reduced } = useMotionPrefs();
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={reduced ? flatParent : staggerParent(stagger, delay)}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
  as = 'div',
  variants,
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  as?: Tag;
  variants?: Variants;
  style?: React.CSSProperties;
}) {
  const { reduced } = useMotionPrefs();
  const Component = motion[as] as typeof motion.div;

  return (
    <Component className={className} style={style} variants={reduced ? flat : (variants ?? fadeUp)}>
      {children}
    </Component>
  );
}
