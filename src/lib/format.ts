const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** 5999 → ٥٩٩٩ (digit substitution only). */
export function toArabicDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}

/** 5999 → ٥٬٩٩٩ — Arabic-Indic digits with the Arabic thousands separator U+066C. */
export function formatRiyal(value: number): string {
  return toArabicDigits(value.toLocaleString('en-US').replace(/,/g, '٬'));
}

/**
 * Figma quotes one price for every storage tier, so the flow reports the same
 * figure whichever tier is picked. Swap in real per-tier pricing here.
 */
export const BASE_PRICE = 5999;
