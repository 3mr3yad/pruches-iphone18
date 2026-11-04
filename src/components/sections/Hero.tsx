'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { EASE, fadeUpHero, flat, flatParent, lineMask, staggerParent } from '@/lib/motion';
import { HERO, PRODUCT_NAME_AR, PRODUCT_NAME_LATIN } from '@/lib/content';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { Button } from '../ui/Button';

export function Hero({ ctaRef }: { ctaRef?: React.RefObject<HTMLButtonElement> }) {
  const { reduced } = useMotionPrefs();
  const { openFlow, open } = usePurchaseFlow();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const itemVariants = reduced ? flat : fadeUpHero;

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-bg pb-10 lg:min-h-[960px] lg:pb-0"
    >
      {/* Plum glow behind the product, pulsing slowly. */}
      <div
        aria-hidden
        className="glow-hero animate-glow-pulse pointer-events-none absolute left-1/2 top-[320px] -z-10 h-[880px] w-[700px] -translate-x-1/2 lg:hidden"
      />
      <div
        aria-hidden
        className="glow-hero-desktop animate-glow-pulse pointer-events-none absolute inset-0 -z-10 hidden lg:block"
      />

      {/* Product photography */}
      <motion.div
        aria-hidden={false}
        style={reduced ? undefined : { y: parallaxY }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0.15 : 0.9, ease: EASE }}
        className="relative h-[468px] w-full overflow-hidden lg:h-[960px]"
      >
        {/*
          Mobile crops the 1440×960 hero to the phones (Figma: left −44.62%,
          right −44.8%); desktop shows it full-bleed.
        */}
        <div className="absolute inset-y-0 -left-[44.8%] -right-[44.62%] -top-[6px] lg:inset-0">
          <Image
            src="/images/hero.webp"
            alt={`${PRODUCT_NAME_AR} باللون العنابي`}
            width={1440}
            height={960}
            priority
            sizes="(max-width: 1023px) 190vw, 100vw"
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 top-[318px] h-[150px] bg-gradient-to-b from-transparent to-black lg:top-auto lg:bottom-0 lg:h-[420px]"
        />
      </motion.div>

      {/* Copy */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={reduced ? flatParent : staggerParent(0.08, 0.15)}
        className="mobile-col relative z-10 -mt-[34px] flex flex-col items-center px-gutter text-center lg:absolute lg:inset-x-0 lg:bottom-[156px] lg:mt-0 lg:px-20"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex h-7 items-center gap-1.5 rounded-pill border border-pink/25 bg-pink/[0.12] px-3 lg:h-auto lg:border-[#543247] lg:bg-plum lg:px-3.5 lg:py-1.5"
        >
          <span className="text-xs font-bold text-pink lg:text-[13px] lg:font-semibold">
            {HERO.chip}
          </span>
          <Image src="/icons/dot.svg" alt="" width={6} height={6} aria-hidden />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-3.5 font-latin text-xl text-pink lg:mt-6 lg:text-[clamp(1.3125rem,2.22vw,2rem)] lg:tracking-[-0.8px]"
        >
          {PRODUCT_NAME_LATIN}
        </motion.p>

        <motion.h1
          id="hero-title"
          variants={reduced ? flat : lineMask}
          className="text-[46px] font-extrabold leading-[1.25] text-white lg:text-[clamp(2.625rem,4.58vw,4.125rem)] lg:leading-[1.45]"
        >
          {HERO.title}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-2 max-w-[320px] text-[15px] leading-[1.8] text-body lg:mt-2 lg:max-w-[760px] lg:text-[17px] lg:leading-[1.9] lg:text-modal-body"
        >
          {HERO.copyLead}
          <strong className="font-bold text-white lg:text-pink">{HERO.copyStrong}</strong>
        </motion.p>

        <motion.div variants={itemVariants} className="mt-[22px] w-full lg:mt-8 lg:w-[443px]">
          <Button
            ref={ctaRef}
            size="lg"
            className="w-full"
            onClick={(event) => openFlow(event.currentTarget)}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            {HERO.cta}
          </Button>
        </motion.div>

        <motion.p variants={itemVariants} className="mt-3 text-[12.5px] text-muted lg:mt-4 lg:text-xs">
          {HERO.note}
        </motion.p>

        {/* Mobile-only trust row */}
        <motion.ul
          variants={itemVariants}
          className="mt-[22px] flex items-center gap-[18px] lg:hidden"
        >
          {HERO.trust.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5">
              <Image src={item.icon} alt="" width={16} height={16} aria-hidden />
              <span className="text-[12.5px] font-semibold text-body">{item.label}</span>
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Desktop-only footer row of the hero */}
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.15 : 0.5, ease: EASE, delay: 0.6 }}
        className="absolute inset-x-[76px] bottom-[46px] z-10 hidden items-center justify-between lg:flex"
      >
        {/* RTL: the model text leads so it sits on the right, the arrow on the left. */}
        <div className="flex flex-col items-start text-start">
          <p className="text-[23px] text-body">{HERO.modelLabel}</p>
          <p className="text-[clamp(1.3125rem,2.22vw,2rem)] text-white">{PRODUCT_NAME_AR}</p>
        </div>
        <a
          href="#pickup"
          aria-label="انتقل إلى الأسفل"
          className="inline-flex size-14 items-center justify-center rounded-[28px] border-2 border-[#8e898e] text-[#8e898e] transition-colors duration-200 ease-quint hover:border-white hover:text-white"
        >
          <svg viewBox="0 0 30 30" width={30} height={30} aria-hidden>
            <path
              d="M15 7v16M15 23l-6-6M15 23l6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </motion.div>
    </section>
  );
}
