'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import { NAV_ITEMS } from '@/lib/content';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { useHeaderState, useMediaQuery } from '@/hooks/useViewport';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { MobileMenu } from './MobileMenu';
import { OvfleWordmark } from '@/components/brand/OvfleWordmark';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openFlow, open: flowOpen } = usePurchaseFlow();
  const { solid, hidden } = useHeaderState(menuOpen || flowOpen);
  const { reduced } = useMotionPrefs();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Retracting on scroll down is mobile-only. It has to be gated here rather
  // than with an `lg:translate-y-0` class, because motion writes the inline
  // transform itself and would overwrite the class.
  const retract = hidden && !reduced && !isDesktop;

  return (
    <>
      <motion.header
        animate={{ y: retract ? '-100%' : '0%' }}
        transition={reduced ? { duration: 0.15 } : { duration: 0.3, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-40 h-[60px] lg:h-[84px] ${
          solid
            ? 'border-b border-line bg-[rgba(8,7,8,0.86)] backdrop-blur-[7px]'
            : 'border-b border-transparent bg-transparent'
        } transition-[background-color,border-color] duration-300 ease-quint`}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between ps-gutter pe-3 lg:ps-20 lg:pe-20">
          {/* Logo sits at the start — the right in RTL. */}
          <a
            href="#top"
            className="-ms-2 inline-flex min-h-11 shrink-0 items-center px-2"
            aria-label="Ovfle — الصفحة الرئيسية"
          >
            <OvfleWordmark className="text-[1.6rem] lg:text-[1.9rem]" />
          </a>

          <nav aria-label="روابط الصفحة" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-flex h-11 items-center text-base text-[#e8e4df] transition-colors duration-200 ease-quint hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={(event) => openFlow(event.currentTarget)}
            aria-haspopup="dialog"
            aria-expanded={flowOpen}
            className="hidden h-11 w-[140px] items-center justify-center rounded-pill border border-white/60 text-base font-bold text-white transition-colors duration-200 ease-quint hover:border-pink hover:text-pink lg:inline-flex"
          >
            اطلب الآن
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-label="القائمة"
            className="inline-flex size-11 items-center justify-center rounded-[12px] border border-white/[0.08] bg-white/[0.06] lg:hidden"
          >
            <Image src="/icons/menu.svg" alt="" width={20} height={20} aria-hidden />
          </button>
        </div>
      </motion.header>

      <MobileMenu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          requestAnimationFrame(() => menuButtonRef.current?.focus());
        }}
      />
    </>
  );
}
