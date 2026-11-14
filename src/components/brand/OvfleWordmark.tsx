import type { CSSProperties } from 'react';

/**
 * The Ovfle logo: the Latin wordmark «Ovfle» (kit: C:\xampp\htdocs\ovfle-brand).
 * Poppins 500, −0.02em tracking, line-height 1, never wrapped, LTR and never
 * machine-translated. Size it with font-size (className). White here, as this
 * page's header, menu and footer are all dark; the kit's sky/navy tones are
 * available via `color`.
 */
export function OvfleWordmark({
  className = '',
  color = '#FFFFFF',
}: {
  className?: string;
  color?: CSSProperties['color'];
}) {
  return (
    <span
      dir="ltr"
      lang="en"
      translate="no"
      className={`inline-block whitespace-nowrap font-latin font-medium leading-none tracking-[-0.02em] ${className}`}
      style={{ color }}
    >
      Ovfle
    </span>
  );
}
