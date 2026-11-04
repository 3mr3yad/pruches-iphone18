'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js/min';

/** Saudi Arabia first, then the rest of the Gulf and nearby, then everyone else A–Z (Arabic). */
const PINNED: CountryCode[] = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'EG', 'JO'];

const SEARCH_LABEL = 'ابحث عن دولة أو رمز';
const NO_RESULTS = 'لا توجد نتائج';

const flagOf = (cc: string) =>
  String.fromCodePoint(...Array.from(cc).map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));

type CountryOption = { code: CountryCode; dial: string; name: string };

function useCountryOptions(): CountryOption[] {
  return useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames(['ar'], { type: 'region' });
    } catch {
      // Older browsers: fall back to the ISO code.
    }
    const all = getCountries().map((code) => ({
      code,
      dial: `+${getCountryCallingCode(code)}`,
      name: names?.of(code) ?? code,
    }));
    const pinned = PINNED.map((code) => all.find((c) => c.code === code)).filter(
      (c): c is CountryOption => Boolean(c),
    );
    const rest = all
      .filter((c) => !PINNED.includes(c.code))
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    return [...pinned, ...rest];
  }, []);
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    aria-hidden
    viewBox="0 0 10 6"
    width={9}
    height={6}
    className={`text-muted transition-transform duration-200 ease-quint ${open ? 'rotate-180' : ''}`}
  >
    <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Tick = () => (
  <svg aria-hidden viewBox="0 0 12 10" width={11} height={9} className="text-pink">
    <path
      d="M1 5l3.5 3.5L11 1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Room above/below the trigger inside the scrolling column, so the list is never clipped. */
function placementFor(trigger: HTMLElement): { up: boolean; maxHeight: number } {
  const box = trigger.getBoundingClientRect();
  const scroller = trigger.closest('.overflow-y-auto');
  const area = scroller
    ? scroller.getBoundingClientRect()
    : { top: 0, bottom: window.innerHeight };
  const below = area.bottom - box.bottom - 8;
  const above = box.top - area.top - 8;
  const up = below < 280 && above > below;
  return { up, maxHeight: Math.max(180, Math.min(340, up ? above : below)) };
}

/**
 * The dial-code box beside the phone input (Figma 494:199), as a country
 * picker: a dark, searchable listbox in the modal's own tokens. The browser's
 * native <select> list can't be styled and renders white-on-white on Windows.
 */
export function CountryCodeSelect({
  value,
  onChange,
  label,
  variant,
}: {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
  label: string;
  variant: 'sheet' | 'modal';
}) {
  const isModal = variant === 'modal';
  const options = useCountryOptions();
  const current = options.find((c) => c.code === value);
  const uid = useId().replace(/:/g, '');
  const listId = `${uid}-list`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [place, setPlace] = useState({ up: false, maxHeight: 320 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return options;
    return options.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.slice(1).startsWith(q) ||
        c.code.toLowerCase() === q,
    );
  }, [options, query]);

  const openList = () => {
    if (triggerRef.current) setPlace(placementFor(triggerRef.current));
    setQuery('');
    setActive(Math.max(0, options.findIndex((c) => c.code === value)));
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (code: CountryCode) => {
    onChange(code);
    close();
  };

  // Focus the search box on open; close on a press anywhere outside.
  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus({ preventScroll: true });
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // Keep the highlighted row in view.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const pick = filtered[active];
      if (pick) choose(pick.code);
    } else if (event.key === 'Tab') {
      close(false);
    }
  };

  const shape = isModal
    ? 'h-12 w-[124px] rounded-[14px] border-modal-tile-line bg-modal-tile text-[15px]'
    : 'h-[52px] w-[108px] rounded-2xl border-line-2 bg-card text-sm';

  return (
    // data-own-escape: while open, Esc closes this list rather than the purchase dialog.
    <div ref={rootRef} className="relative shrink-0" data-own-escape={open ? '' : undefined}>
      <button
        ref={triggerRef}
        type="button"
        dir="ltr"
        aria-label={`${label}: ${current?.name ?? ''} ${current?.dial ?? ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(event) => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault();
            openList();
          }
        }}
        className={`inline-flex items-center justify-center gap-1.5 border font-bold text-white outline-offset-2 transition-colors duration-200 ease-quint ${shape} ${
          open ? '!border-pink' : ''
        }`}
      >
        <span aria-hidden className="text-base leading-none">
          {flagOf(value)}
        </span>
        <span>{current?.dial ?? ''}</span>
        <Chevron open={open} />
      </button>

      {open ? (
        <div
          onKeyDown={onKeyDown}
          style={{ maxHeight: place.maxHeight }}
          className={`absolute left-0 z-30 flex w-[288px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-modal-line bg-modal-bg shadow-[0_18px_48px_rgba(0,0,0,0.6)] ${
            place.up ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="border-b border-modal-tile-line p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              placeholder={SEARCH_LABEL}
              aria-label={SEARCH_LABEL}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={
                filtered[active] ? `${uid}-${filtered[active].code}` : undefined
              }
              className="h-10 w-full rounded-xl border border-modal-tile-line bg-modal-tile px-3 text-sm text-white outline-none transition-colors duration-200 ease-quint placeholder:text-muted focus:border-pink"
            />
          </div>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="no-scrollbar flex-1 overflow-y-auto overscroll-contain p-1.5"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-muted">{NO_RESULTS}</li>
            ) : (
              filtered.map((c, index) => {
                const isSelected = c.code === value;
                return (
                  <li
                    key={c.code}
                    id={`${uid}-${c.code}`}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    onPointerEnter={() => setActive(index)}
                    onClick={() => choose(c.code)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
                      index === active ? 'bg-modal-tile-on' : ''
                    } ${isSelected ? 'text-pink' : 'text-white'}`}
                  >
                    <span aria-hidden className="text-base leading-none">
                      {flagOf(c.code)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-start">{c.name}</span>
                    <span
                      dir="ltr"
                      className={`font-latin text-[13px] ${isSelected ? 'text-pink' : 'text-muted'}`}
                    >
                      {c.dial}
                    </span>
                    {isSelected ? <Tick /> : null}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
