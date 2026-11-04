'use client';

import { useEffect, useRef } from 'react';

/** Locks body scroll while `active`, without the layout shift from the scrollbar. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingInlineEnd;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingInlineEnd = `${gap}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingInlineEnd = prevPadding;
    };
  }, [active]);
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab inside the returned ref while `active`, moves focus in on open and
 * calls `onEscape` for the Esc key.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean, onEscape: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const first = node.querySelector<HTMLElement>(FOCUSABLE);
    requestAnimationFrame(() => (first ?? node).focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // A popup inside the dialog (e.g. the country list) handles its own Esc.
        if ((event.target as Element | null)?.closest?.('[data-own-escape]')) return;
        event.stopPropagation();
        onEscape();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) return;

      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const active_ = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (active_ === firstItem || !node.contains(active_))) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && active_ === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [active, onEscape]);

  return ref;
}
