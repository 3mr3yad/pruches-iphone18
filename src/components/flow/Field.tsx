'use client';

import { useId } from 'react';

/**
 * A labelled text input for the shipping form (Figma 494:182–494:204).
 *
 * The modal styling comes straight from the frame — 56px tall, 14px radius,
 * `#171116` on a `#30252E` hairline. The sheet variant has no frame of its own
 * in Figma, so it reuses the bottom-sheet tokens the other sheet steps use
 * (52px tall, 16px radius, `card`/`line-2`).
 *
 * Background, border and radius each live in exactly one branch: two Tailwind
 * utilities for the same property resolve by stylesheet order, not by their
 * position in `className`.
 */
export function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  variant,
  type = 'text',
  inputMode,
  autoComplete,
  dir,
  error,
  addon,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  variant: 'sheet' | 'modal';
  type?: 'text' | 'email' | 'tel';
  inputMode?: 'email' | 'tel' | 'text';
  autoComplete?: string;
  /** `ltr` for the e-mail and phone fields, whose content is Latin/numeric. */
  dir?: 'ltr' | 'rtl';
  error?: string | null;
  /** Rendered after the input in the DOM, i.e. to its left in RTL. */
  addon?: React.ReactNode;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const inputId = `${uid}-field`;
  const errorId = `${uid}-error`;
  const isModal = variant === 'modal';

  const shape = isModal
    ? 'h-12 rounded-[14px] bg-modal-tile text-[15px]'
    : 'h-[52px] rounded-2xl bg-card text-sm';
  const border = error ? 'border-pink/70' : isModal ? 'border-modal-tile-line' : 'border-line-2';

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      <label
        htmlFor={inputId}
        className={`w-full text-start font-bold text-white ${isModal ? 'text-sm' : 'text-[13px]'}`}
      >
        {label}
      </label>

      <div className="flex w-full items-start gap-3">
        <input
          id={inputId}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          dir={dir}
          value={value}
          placeholder={placeholder}
          aria-required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={`min-w-0 flex-1 border px-4 text-white outline-offset-2 transition-colors duration-200 ease-quint placeholder:text-muted focus:border-pink ${shape} ${border}`}
        />
        {addon}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="w-full text-start text-[11px] text-pink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
