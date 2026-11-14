'use client';

import { useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import { MENU_ITEMS, PRICE_SAVING, PRICE_WAFI, RIYAL } from '@/lib/content';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { useFocusTrap, useScrollLock } from '@/hooks/useDialog';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { Button } from './ui/Button';
import { OvfleWordmark } from '@/components/brand/OvfleWordmark';

const Chevron = () => (
  <svg viewBox="0 0 18 18" width={18} height={18} aria-hidden className="shrink-0">
    <path
      d="M11.25 4.5L6.75 9l4.5 4.5"
      fill="none"
      stroke="#8E848E"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { reduced } = useMotionPrefs();
  const { openFlow } = usePurchaseFlow();
  useScrollLock(open);
  const panelRef = useFocusTrap<HTMLDivElement>(open, onClose);

  const go = useCallback(
    (href: string) => {
      onClose();
      // Let the overlay unmount before the smooth scroll starts.
      requestAnimationFrame(() => {
        document.querySelector(href)?.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    },
    [onClose, reduced],
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.25, ease: EASE }}
          className="fixed inset-0 z-50 bg-[#070607] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="القائمة"
        >
          <div ref={panelRef} className="flex h-full flex-col" tabIndex={-1}>
            <div className="flex h-[60px] shrink-0 items-center justify-between ps-gutter pe-3">
              <OvfleWordmark className="text-[1.6rem]" />
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق القائمة"
                className="inline-flex size-11 items-center justify-center rounded-[12px] border border-white/[0.08] bg-white/[0.06]"
              >
                <svg viewBox="0 0 18 18" width={18} height={18} aria-hidden>
                  <path
                    d="M4 4l10 10M14 4L4 14"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav aria-label="القائمة" className="mt-5 flex-1 overflow-y-auto px-gutter">
              <ul>
                {MENU_ITEMS.map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: reduced ? 0.15 : 0.4,
                      ease: EASE,
                      delay: reduced ? 0 : 0.06 + index * 0.05,
                    }}
                    className="border-b border-line"
                  >
                    <a
                      href={item.href}
                      onClick={(event) => {
                        event.preventDefault();
                        go(item.href);
                      }}
                      className="flex h-16 items-center justify-between text-[22px] font-bold text-white"
                    >
                      <span>{item.label}</span>
                      <Chevron />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="shrink-0 space-y-3 px-gutter pb-8 pt-4">
              <div className="flex gap-2.5">
                <div className="flex flex-1 flex-col items-end rounded-2xl border border-line p-3">
                  <p className="text-sm font-bold text-white">
                    {PRICE_WAFI} {RIYAL}
                  </p>
                  <p className="text-xs text-body">سعر وافي</p>
                </div>
                <div className="flex flex-1 flex-col items-end rounded-2xl border border-line p-3">
                  <p className="text-sm font-bold text-white">
                    {PRICE_SAVING} {RIYAL}
                  </p>
                  <p className="text-xs text-body">توفير عند الاستلام</p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={(event) => {
                  const trigger = event.currentTarget;
                  onClose();
                  openFlow(trigger);
                }}
              >
                اطلب الآن
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
