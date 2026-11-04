'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import { FAQ, FAQ_TITLE } from '@/lib/content';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { Reveal, RevealItem } from '../ui/Reveal';

export function Faq() {
  // Figma opens the first question by default; one item is open at a time.
  const [openIndex, setOpenIndex] = useState(0);
  const { reduced } = useMotionPrefs();
  const base = useId().replace(/:/g, '');

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="flex flex-col items-start px-gutter py-section lg:px-[74px] lg:pb-16 lg:pt-[50px]"
    >
      <Reveal className="mobile-col">
        <RevealItem
          as="h2"
          className="w-full text-center font-display text-[42px] font-extrabold leading-[1.15] text-white lg:font-sans lg:text-[clamp(2.875rem,5.21vw,4.6875rem)] lg:leading-[1.08]"
        >
          <span id="faq-title">{FAQ_TITLE}</span>
        </RevealItem>

        <RevealItem className="mt-[22px] w-full lg:mt-6">
          <div aria-hidden className="hidden h-0.5 w-full bg-[#282528] lg:block" />
          <ul className="w-full">
            {FAQ.map((item, index) => {
              const isOpen = index === openIndex;
              const buttonId = `${base}-faq-q${index}`;
              const panelId = `${base}-faq-a${index}`;

              return (
                <li key={item.q} className="w-full border-t border-line-2 lg:border-t-0 lg:border-b-2 lg:border-b-[#282528]">
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="flex w-full items-center gap-3 py-3.5 text-start lg:min-h-[69px] lg:gap-6 lg:py-0"
                    >
                      <motion.span
                        aria-hidden
                        animate={{
                          rotate: isOpen && !reduced ? 180 : 0,
                          backgroundColor: isOpen ? '#F0ACD7' : 'rgba(0,0,0,0)',
                          color: isOpen ? '#100C10' : '#B9B6B9',
                          borderColor: isOpen ? '#F0ACD7' : '#2A2A2D',
                        }}
                        transition={{ duration: reduced ? 0.15 : 0.25, ease: EASE }}
                        // An explicit square at every breakpoint: `size-auto`
                        // let the glyph set the width, and motion's inline
                        // background beat `bg-transparent`, so the toggle came
                        // out as a tall capsule instead of a circle.
                        className="grid size-[30px] shrink-0 place-items-center rounded-full border text-lg leading-none lg:size-11 lg:text-[clamp(1.375rem,1.94vw,1.75rem)]"
                      >
                        {isOpen ? '−' : '+'}
                      </motion.span>
                      <span className="flex-1 text-[15.5px] font-bold text-white lg:text-[clamp(1.25rem,2.01vw,1.8125rem)] lg:leading-[1.35]">
                        {item.q}
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="panel"
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0.15 : 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="pb-[18px] text-sm leading-[1.85] text-body lg:pb-[22px] lg:text-[clamp(1.125rem,1.88vw,1.6875rem)] lg:leading-[1.35]">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
          <div aria-hidden className="h-px w-full bg-line-2 lg:hidden" />
        </RevealItem>
      </Reveal>
    </section>
  );
}
