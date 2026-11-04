'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { EASE } from '@/lib/motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

const C = 100; // centre
const R_HOUSING = 80; // inner radius of the housing ring
const R_OUT = 104; // blades run past the housing and get clipped
/** tan(30°) with a touch of overlap, so six blades meet with no seam. */
const K = (1.06 * Math.tan(Math.PI / 6)) as number;

const H_OPEN = 62; // inradius of the hexagonal opening, wide open
const H_SHUT = 13; // …and stopped down

/**
 * One blade: a 60°-wide wedge whose inner edge is the side of the hexagonal
 * opening, bowed slightly towards the centre the way a real blade is.
 * Six copies at 60° intervals leave a regular hexagon of inradius `h`.
 */
function bladePath(h: number): string {
  const xi = C + h;
  const yi = K * h;
  const xo = C + R_OUT;
  const yo = K * R_OUT;
  // Control point pulls the inner edge in by ~9% of h.
  const cx = C + h * 0.91;
  return [
    `M ${xi.toFixed(2)} ${(C - yi).toFixed(2)}`,
    `Q ${cx.toFixed(2)} ${C} ${xi.toFixed(2)} ${(C + yi).toFixed(2)}`,
    `L ${xo.toFixed(2)} ${(C + yo).toFixed(2)}`,
    `L ${xo.toFixed(2)} ${(C - yo).toFixed(2)}`,
    'Z',
  ].join(' ');
}

/** 0 → wide open, 1 → stopped down. */
const hFor = (t: number) => H_OPEN + (H_SHUT - H_OPEN) * t;

export function ApertureSvg({ className }: { className?: string }) {
  const { reduced } = useMotionPrefs();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pulsing = useRef(false);
  const uid = useId().replace(/:/g, '');

  /** Single source of truth: 0 = open, 1 = shut. */
  const t = useMotionValue(reduced ? 0.45 : 0);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start end', 'end start'],
  });

  // Scroll takes the iris shut and back open across its pass through the viewport.
  const scrubbed = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  useMotionValueEvent(scrubbed, 'change', (value) => {
    if (reduced || pulsing.current) return;
    t.set(value);
  });

  useEffect(() => {
    if (reduced) t.set(0.45);
  }, [reduced, t]);

  /** Tap or hover runs one full close-and-open cycle, then hands back to scroll. */
  const cycle = useCallback(() => {
    if (reduced || pulsing.current) return;
    pulsing.current = true;
    animate(t, [t.get(), 1, 0], {
      duration: 1.1,
      ease: EASE,
      times: [0, 0.55, 1],
      onComplete: () => {
        pulsing.current = false;
        t.set(scrubbed.get());
      },
    });
  }, [reduced, t, scrubbed]);

  const d = useTransform(t, (value) => bladePath(hFor(value)));
  const spin = useTransform(t, [0, 1], [0, 32]);
  const coreOpacity = useTransform(t, [0, 1], [0.55, 0.14]);

  const clipId = `iris-clip-${uid}`;
  const bladeGradId = `iris-blade-${uid}`;
  const coreGradId = `iris-core-${uid}`;

  return (
    <div ref={wrapRef} className={`relative ${className ?? ''}`}>
      <motion.svg
        viewBox="0 0 200 200"
        role="img"
        aria-label="فتحة عدسة متغيرة من ست شفرات"
        className="h-full w-full cursor-pointer"
        onClick={cycle}
        onHoverStart={cycle}
        whileTap={reduced ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2, ease: EASE }}
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={C} cy={C} r={R_HOUSING} />
          </clipPath>
          <linearGradient id={bladeGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B2430" />
            <stop offset="55%" stopColor="#241720" />
            <stop offset="100%" stopColor="#150F13" />
          </linearGradient>
          <radialGradient id={coreGradId}>
            <stop offset="0%" stopColor="#F0ACD7" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#784760" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#784760" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow behind the opening */}
        <motion.circle cx={C} cy={C} r={58} fill={`url(#${coreGradId})`} style={{ opacity: coreOpacity }} />

        {/* Six blades */}
        <g clipPath={`url(#${clipId})`}>
          <motion.g style={{ rotate: spin, transformOrigin: `${C}px ${C}px` }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} transform={`rotate(${i * 60} ${C} ${C})`}>
                <motion.path
                  d={d as MotionValue<string>}
                  fill={`url(#${bladeGradId})`}
                  stroke="rgba(240,172,215,0.22)"
                  strokeWidth={0.8}
                />
              </g>
            ))}
          </motion.g>
        </g>

        {/* Housing */}
        <circle cx={C} cy={C} r={R_HOUSING} fill="none" stroke="#2A2A2D" strokeWidth={2} />
        <circle cx={C} cy={C} r={R_HOUSING + 7} fill="none" stroke="#1F1F21" strokeWidth={1.5} />
        <circle
          cx={C}
          cy={C}
          r={R_HOUSING + 14}
          fill="none"
          stroke="rgba(240,172,215,0.18)"
          strokeWidth={1}
          strokeDasharray="2 6"
        />
      </motion.svg>
    </div>
  );
}
