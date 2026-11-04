'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

/**
 * Counts from 0 to `to` over ~900ms the first time it scrolls into view.
 * With reduced motion it renders the final value straight away.
 */
export function CountUp({
  to,
  decimals = 0,
  prefix,
  suffix,
  duration = 900,
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const { reduced } = useMotionPrefs();
  // Always start at 0 so the server and the first client render agree;
  // the effect below jumps straight to the final value for reduced motion.
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    if (!isInView) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out-quint, matching the page easing
      const eased = 1 - Math.pow(1 - t, 5);
      setValue(to * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, reduced, to, duration]);

  return (
    <span ref={ref} className={className}>
      {/* Latin digits stay upright inside the Arabic column. */}
      <bdi>
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </bdi>
    </span>
  );
}
