'use client';

import { useId } from 'react';

/**
 * Display text drawn as an outline only, on the *outside* of the glyphs.
 *
 * `-webkit-text-stroke` centres its stroke on the glyph outline, so half of it
 * lands inside. On Arabic letterforms the thin stems, joins and dot boxes are
 * narrower than the stroke, so the two inner halves meet and fill in as solid
 * white blobs. Painting the stroke at double width and masking away the glyph
 * interior leaves exactly `strokeWidth` on the outside and nothing within —
 * and unlike filling with the page colour, the interior stays transparent so
 * the plum glow behind it still shows through.
 */
export function OutlinedText({
  text,
  size,
  strokeWidth = 2,
  align = 'center',
  stroke = '#ffffff',
  strokeOpacity = 0.5,
  className,
}: {
  text: string;
  /**
   * Any CSS length, so it can be fluid (a `clamp()`); the SVG takes its font
   * size from CSS and its box from that, rather than from a fixed number.
   */
  size: string;
  strokeWidth?: number;
  align?: 'center' | 'start';
  stroke?: string;
  /** Applied to the whole <text>, not the paint — see the note below. */
  strokeOpacity?: number;
  className?: string;
}) {
  const maskId = `outline-${useId().replace(/:/g, '')}`;

  const glyphs = {
    x: align === 'center' ? '50%' : '100%',
    // The box is 1.2em tall, so a baseline at 0.92em sits 76.7% down it.
    y: '76.7%',
    textAnchor: align === 'center' ? ('middle' as const) : ('start' as const),
    // RTL so `start` anchors to the right edge, matching the Arabic reading order.
    direction: 'rtl' as const,
    fontWeight: 800,
  };

  return (
    <svg
      width="100%"
      style={{ fontSize: size, height: `calc(${size} * 1.2)` }}
      aria-hidden
      focusable="false"
      className={`block overflow-visible font-sans ${className ?? ''}`}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {/* Black knocks the glyph interior out of the mask. */}
          <text {...glyphs} fill="black">
            {text}
          </text>
        </mask>
      </defs>
      {/*
        The fade is `opacity` on the whole <text>, not a translucent stroke
        paint: glyphs are painted one by one, so a translucent stroke stacks
        wherever adjoining Arabic letterforms overlap and reads as bright
        patches. Element opacity flattens the outline before fading it.
      */}
      <text
        {...glyphs}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth * 2}
        strokeLinejoin="round"
        opacity={strokeOpacity}
        mask={`url(#${maskId})`}
      >
        {text}
      </text>
    </svg>
  );
}
