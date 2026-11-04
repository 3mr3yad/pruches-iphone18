'use client';

import { useEffect, useState } from 'react';

/** True once the media query matches. Starts false, so SSR renders the mobile tree. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** The modal replaces the bottom sheet from 768px up (brief §9). */
export const useIsDesktopDialog = () => useMediaQuery('(min-width: 768px)');

type HeaderState = {
  /** Past 40px of scroll the header turns solid with a blur + bottom border. */
  solid: boolean;
  /** Mobile only: hide on scroll down, show again on scroll up. */
  hidden: boolean;
};

export function useHeaderState(locked: boolean): HeaderState {
  const [state, setState] = useState<HeaderState>({ solid: false, hidden: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const read = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      setState((prev) => {
        const solid = y > 40;
        // Ignore jitter under 6px, and never hide while near the top.
        let hidden = prev.hidden;
        if (Math.abs(delta) > 6) hidden = delta > 0 && y > 120;
        if (y <= 120) hidden = false;
        return prev.solid === solid && prev.hidden === hidden ? prev : { solid, hidden };
      });
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // A dialog is open: keep the header put rather than letting it slide away.
  return locked ? { solid: state.solid, hidden: false } : state;
}
