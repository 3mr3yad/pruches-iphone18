'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import { FINISHES, FINISHES_SECTION, type ColorId } from '@/lib/content';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { Reveal, RevealItem } from '../ui/Reveal';
import { Button } from '../ui/Button';

/** lg re-orders the swatches to the desktop frame: أسود · أزرق جليدي · عنابي. */
const LG_ORDER: Record<ColorId, string> = {
  burgundy: 'lg:order-3',
  black: 'lg:order-1',
  glacier: 'lg:order-2',
};

function Swatch({
  id,
  name,
  dot,
  selected,
  onSelect,
  size,
  showLabel,
}: {
  id: ColorId;
  name: string;
  dot: string;
  selected: boolean;
  onSelect: () => void;
  size: 'sm' | 'lg';
  showLabel: boolean;
}) {
  const { reduced } = useMotionPrefs();
  const box = size === 'sm' ? 'size-12' : 'size-[74px]';
  const inner = size === 'sm' ? 'size-[34px]' : 'size-[60px]';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={name}
      className={`flex min-h-11 flex-col items-center gap-2 ${LG_ORDER[id]}`}
    >
      <span className={`relative grid ${box} place-items-center`}>
        <span aria-hidden className="absolute inset-0 rounded-full border-2 border-white/15" />
        {selected ? (
          <motion.span
            aria-hidden
            layoutId="finish-ring"
            className="absolute inset-0 rounded-full border-2 border-white"
            transition={reduced ? { duration: 0.15 } : { duration: 0.4, ease: EASE }}
          />
        ) : null}
        <span
          aria-hidden
          className={`${inner} rounded-full ring-1 ring-inset ring-white/25`}
          style={{ backgroundColor: dot }}
        />
      </span>
      {showLabel ? (
        <span
          className={`text-[12.5px] font-semibold ${selected ? 'text-white' : 'text-body'}`}
        >
          {name}
        </span>
      ) : null}
    </button>
  );
}

/**
 * The burgundy sheet is one tall photo; Figma crops it to the phones with the
 * percentages below. Keeping the crop in CSS preserves the original pixels.
 */
function PhoneCrop({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <Image
        src={src}
        alt={alt}
        width={724}
        height={2172}
        sizes="(max-width: 1023px) 300px, 531px"
        className="absolute left-[-80.79%] top-[-413.48%] h-[869.57%] w-[376.84%] max-w-none"
      />
    </div>
  );
}

export function Finishes() {
  const { reduced } = useMotionPrefs();
  const { color, setColor, openFlow } = usePurchaseFlow();
  const active = FINISHES.find((finish) => finish.id === color) ?? FINISHES[0];

  const fade = reduced ? { duration: 0.15 } : { duration: 0.35, ease: EASE };

  const heading = (className: string) => (
    <AnimatePresence mode="wait" initial={false}>
      <motion.h2
        key={active.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        className={className}
      >
        {active.heading}
      </motion.h2>
    </AnimatePresence>
  );

  const swatches = (size: 'sm' | 'lg', showLabel: boolean) => (
    <div className={`flex items-start ${size === 'sm' ? 'gap-[22px]' : 'gap-[30px]'}`}>
      {FINISHES.map((finish) => (
        <Swatch
          key={finish.id}
          id={finish.id}
          name={finish.name}
          dot={finish.dot}
          selected={finish.id === color}
          onSelect={() => setColor(finish.id)}
          size={size}
          showLabel={showLabel}
        />
      ))}
    </div>
  );

  return (
    <section id="colors" aria-labelledby="colors-title" className="lg:overflow-hidden">
      {/* ------------------------------- mobile ------------------------------- */}
      <Reveal className="mobile-col flex flex-col items-start px-gutter py-section lg:hidden">
        <RevealItem className="mx-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
            >
              <PhoneCrop
                src={active.image}
                alt={`آيفون 18 برو ماكس باللون ${active.name}`}
                className="h-[390px] w-[300px]"
              />
            </motion.div>
          </AnimatePresence>
        </RevealItem>

        <RevealItem as="p" className="w-full text-[13px] font-semibold text-pink">
          <span id="colors-title">{FINISHES_SECTION.eyebrow}</span>
        </RevealItem>
        <RevealItem className="w-full font-display text-[42px] font-extrabold leading-[1.15] text-white">
          {heading('font-display text-[42px] font-extrabold leading-[1.15] text-white')}
        </RevealItem>

        <RevealItem className="mt-[22px]">{swatches('sm', true)}</RevealItem>

        <RevealItem as="p" className="mt-[18px] w-full text-[15px] leading-[1.9] text-body">
          {FINISHES_SECTION.copy}
        </RevealItem>

        <RevealItem className="mt-[22px] w-full">
          <Button className="w-full" onClick={(event) => openFlow(event.currentTarget)}>
            {FINISHES_SECTION.cta}
          </Button>
        </RevealItem>
      </Reveal>

      {/* ------------------------------- desktop ------------------------------- */}
      <Reveal className="hidden h-[700px] items-center lg:flex">
        {/* RTL: the photo leads so it lands on the right, copy on the left. */}
        <RevealItem className="shrink-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
            >
              <PhoneCrop
                src={active.image}
                alt={`آيفون 18 برو ماكس باللون ${active.name}`}
                className="aspect-[531/690] h-auto w-[36.9vw] max-w-[531px]"
              />
            </motion.div>
          </AnimatePresence>
        </RevealItem>

        <div className="flex flex-1 flex-col items-start ps-[4.5vw] pe-[10.4vw] text-start">
          <RevealItem as="p" className="text-[clamp(1.3125rem,2.22vw,2rem)] leading-[1.35] text-body">
            {FINISHES_SECTION.eyebrow}
          </RevealItem>
          <RevealItem className="mt-5">
            {heading('text-[clamp(4rem,6.94vw,6.25rem)] font-extrabold leading-[1.6] text-white')}
          </RevealItem>
          <RevealItem as="p" className="mt-5 text-[clamp(1.375rem,2.36vw,2.125rem)] leading-[1.35] text-body">
            {FINISHES_SECTION.copy}
          </RevealItem>
          <RevealItem className="mt-5">{swatches('lg', false)}</RevealItem>
          <RevealItem as="p" className="mt-5 text-[clamp(1.25rem,2.08vw,1.875rem)] leading-[1.35] text-body">
            {FINISHES_SECTION.swatchList}
          </RevealItem>
          <RevealItem className="mt-16 w-full max-w-[620px]">
            <Button size="lg" className="w-full" onClick={(event) => openFlow(event.currentTarget)}>
              {FINISHES_SECTION.cta}
            </Button>
          </RevealItem>
        </div>
      </Reveal>
    </section>
  );
}
