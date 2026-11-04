'use client';

import { useRef } from 'react';
import { useInView } from 'motion/react';
import { ACCESSORIES, ACCESSORIES_TITLE } from '@/lib/content';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { ACCESSORY_ICON_MARKUP } from '@/lib/accessory-icons';
import { Reveal, RevealItem } from '../ui/Reveal';

/**
 * The icon markup is inlined (see scripts/inline-icons.py) so the stroke-draw
 * can run on it; `.draw-icon` handles the dash animation in globals.css.
 */
function AccessoryIcon({ name, className }: { name: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const { reduced } = useMotionPrefs();

  return (
    <svg
      ref={ref}
      viewBox="0 0 34 34"
      width={34}
      height={34}
      fill="none"
      aria-hidden
      className={`draw-icon ${inView || reduced ? 'is-drawn' : ''} ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: ACCESSORY_ICON_MARKUP[name] ?? '' }}
    />
  );
}

export function Accessories() {
  return (
    <section
      id="accessories"
      aria-labelledby="accessories-title"
      className="flex flex-col items-center bg-bg px-gutter py-section lg:bg-[#0a090a] lg:px-[78px] lg:pb-[45px] lg:pt-12"
    >
      <Reveal className="mobile-col flex flex-col items-center">
        <RevealItem
          as="h2"
          className="w-full text-center font-display text-[42px] font-extrabold leading-[1.15] text-white lg:max-w-[1000px] lg:font-sans lg:text-[clamp(2.875rem,5.21vw,4.6875rem)] lg:leading-[1.08]"
        >
          <span id="accessories-title">{ACCESSORIES_TITLE}</span>
        </RevealItem>

        <div className="mt-[26px] grid w-full grid-cols-2 gap-3 lg:mt-[25px] lg:grid-cols-3 lg:gap-4">
          {ACCESSORIES.map((item) => (
            <RevealItem
              key={item.title}
              className={`group flex h-44 flex-col items-start rounded-card border border-line bg-card p-4 transition-[transform,border-color] duration-200 ease-quint lg:h-[clamp(14rem,22.2vw,20rem)] lg:p-8 lg:hover:-translate-y-1 lg:hover:border-line-2 ${item.lgOrder}`}
            >
              <AccessoryIcon name={item.icon} className="size-[34px] shrink-0 lg:size-[52px]" />
              <div className="mt-auto flex w-full flex-col gap-1 text-start">
                <p className="text-[15px] font-bold leading-normal text-white lg:text-2xl lg:leading-[1.35]">
                  {item.title}
                </p>
                <p className="text-xs leading-[1.6] text-muted lg:text-base lg:leading-[1.35] lg:text-body">
                  {item.desc}
                </p>
              </div>
            </RevealItem>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
