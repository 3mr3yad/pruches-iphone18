'use client';

import { AnimatePresence, motion } from 'motion/react';

import { PRICE_WAFI, RIYAL, STICKY_BAR } from '@/lib/content';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { Button } from './ui/Button';

/**
 * Mobile only. Slides up once the hero CTA has left the viewport and slides
 * away again once the final CTA section arrives (frame 463:858 / 425:397).
 */
export function StickyBuyBar({ visible }: { visible: boolean }) {
  const { openFlow } = usePurchaseFlow();
  const { reduced } = useMotionPrefs();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="buy-bar"
          initial={reduced ? { opacity: 0 } : { y: '100%' }}
          animate={reduced ? { opacity: 1 } : { y: '0%' }}
          exit={reduced ? { opacity: 0 } : { y: '100%' }}
          transition={reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 380, damping: 36 }}
          className="fixed inset-x-0 bottom-0 z-30 flex h-[86px] items-center justify-between border-t border-line bg-[rgba(10,9,10,0.92)] px-gutter pb-[26px] pt-3 backdrop-blur-lg lg:hidden"
        >
          {/* RTL: price on the right, CTA on the left (Figma 425:397). */}
          <div className="flex flex-col items-start text-start">
            <p className="font-extrabold text-white">
              <span className="text-xl">{PRICE_WAFI}</span>{' '}
              <span className="text-[13px] font-semibold text-body">{RIYAL}</span>
            </p>
            <p className="text-xs font-semibold text-pink">{STICKY_BAR.caption}</p>
          </div>
          <Button
            showArrow={false}
            className="h-12 w-[150px]"
            onClick={(event) => openFlow(event.currentTarget)}
          >
            {STICKY_BAR.cta}
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

