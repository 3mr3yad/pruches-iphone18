import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/min';

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** 5999 → ٥٩٩٩ (digit substitution only). */
export function toArabicDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}

/** ٠٥٥ / ۰۵۵ → 055 (Arabic-Indic and Persian digits to Latin). */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** 5999 → ٥٬٩٩٩ — Arabic-Indic digits with the Arabic thousands separator U+066C. */
export function formatRiyal(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return toArabicDigits(
    rounded.toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, '٬').replace('.', '٫'),
  );
}

/** The API quotes amounts in halalas: 599900 → ٥٬٩٩٩. */
export function formatHalalas(halalas: number): string {
  return formatRiyal(halalas / 100);
}

/**
 * Normalises what people type into the phone field to the 05xxxxxxxx form the
 * API expects. Accepts Arabic digits, spaces, dashes and +966 / 966 / 5xxxxxxxx.
 * Returns null when it isn't a valid Saudi mobile number.
 */
export function normalizeSaudiPhone(input: string): string | null {
  let digits = toLatinDigits(input).replace(/[^\d+]/g, '');
  if (digits.startsWith('+966')) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith('00966')) digits = `0${digits.slice(5)}`;
  else if (digits.startsWith('966')) digits = `0${digits.slice(3)}`;
  else if (/^5\d{8}$/.test(digits)) digits = `0${digits}`;
  return /^05\d{8}$/.test(digits) ? digits : null;
}

/** Local calendar date as YYYY-MM-DD. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type PickupDay = { iso: string; weekday: string; date: string };

const WEEKDAY = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { weekday: 'long' });
const DAY_MONTH = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', {
  day: 'numeric',
  month: 'long',
});

/** The next `count` pickup days starting today, skipping Fridays. */
export function upcomingPickupDays(count: number, from = new Date()): PickupDay[] {
  const days: PickupDay[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  while (days.length < count) {
    if (cursor.getDay() !== 5) {
      days.push({
        iso: toIsoDate(cursor),
        weekday: WEEKDAY.format(cursor),
        date: DAY_MONTH.format(cursor),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/**
 * Validates a phone number against the dial code picked beside the input.
 * Saudi numbers keep the 05xxxxxxxx form the API has always taken; any other
 * country is sent in international E.164 form (e.g. +201001234567).
 * Returns null when the number isn't valid for that country.
 */
export function normalizePhone(input: string, country: CountryCode): string | null {
  if (country === 'SA') return normalizeSaudiPhone(input);
  const parsed = parsePhoneNumberFromString(toLatinDigits(input), country);
  return parsed && parsed.isValid() ? parsed.number : null;
}
