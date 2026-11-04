'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { EASE, fadeUp, flat, inView } from '@/lib/motion';
import { PRICE_COMPARE, PRICE_COMPETITORS, PRICE_SAVING, PRICE_WAFI, RIYAL } from '@/lib/content';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { Reveal, RevealItem } from '../ui/Reveal';
import { Button } from '../ui/Button';

const { eyebrow, title, wafi, competitors, savings, cta } = PRICE_COMPARE;

function Point({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex w-full items-start gap-1.5">
      <Image src={icon} alt="" width={14} height={14} aria-hidden className="mt-0.5 shrink-0" />
      <p className="flex-1 text-start text-xs leading-[1.5] text-body">{children}</p>
    </li>
  );
}

/** Pink border with a light sweep running across it every 4s. */
function SweepBorder({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-card-lg p-px ${className}`}>
      <div aria-hidden className="absolute inset-0 bg-pink/45" />
      <div
        aria-hidden
        className="animate-sweep absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.85)_50%,transparent_100%)]"
      />
      <div className="relative h-full rounded-[19px]">{children}</div>
    </div>
  );
}

/** ٢٠٠ ريال pops in when the strip reaches the viewport. */
function SavingAmount({ className }: { className?: string }) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.p
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: reduced ? 0.15 : 0.45, ease: EASE }}
      className={className}
    >
      {PRICE_SAVING} {RIYAL}
    </motion.p>
  );
}

export function PriceCompare() {
  const { openFlow } = usePurchaseFlow();
  const { reduced } = useMotionPrefs();
  const item = reduced ? flat : fadeUp;

  return (
    <section
      id="pickup"
      aria-labelledby="pickup-title"
      className="bg-gradient-to-b from-black to-[#0a0709] px-gutter py-section lg:bg-none lg:px-20 lg:py-16"
    >
      {/* ------------------------------ mobile / md ----------------------------- */}
      <Reveal className="mobile-col flex flex-col items-start lg:hidden">
        <RevealItem as="p" className="w-full text-[13px] font-semibold text-pink">
          {eyebrow}
        </RevealItem>
        <RevealItem
          as="h2"
          className="mt-2 w-full text-[26px] font-extrabold leading-[1.4] text-white"
        >
          <span id="pickup-title">{title}</span>
        </RevealItem>

        <RevealItem className="mt-6 flex w-full items-stretch gap-3">
          {/* RTL: Wafi leads so it sits on the right, competitors on the left. */}
          <SweepBorder className="flex-1">
            <div className="wafi-card flex h-full flex-col items-start gap-1.5 rounded-[19px] p-4">
              <span className="inline-flex h-6 items-center rounded-pill bg-white px-2.5 text-[11px] font-bold text-[#050505]">
                {wafi.chip}
              </span>
              <p className="mt-1 text-xs text-body">{wafi.name}</p>
              <p className="font-extrabold leading-[1.15] text-white">
                <span className="text-[34px]">{PRICE_WAFI}</span>{' '}
                <span className="text-[15px] font-bold">{RIYAL}</span>
              </p>
              <ul className="mt-auto flex w-full flex-col gap-1.5">
                <Point icon="/icons/check-circle.svg">{wafi.points[0]}</Point>
                <Point icon="/icons/check-circle.svg">{wafi.points[1]}</Point>
              </ul>
            </div>
          </SweepBorder>
          <div className="flex flex-1 flex-col items-start gap-1.5 rounded-card-lg border border-line bg-card p-4">
            <span className="inline-flex h-6 items-center rounded-pill bg-white/[0.06] px-2.5 text-[11px] font-bold text-muted">
              {competitors.chip}
            </span>
            <p className="mt-1 text-xs text-body">{competitors.name}</p>
            <p className="font-extrabold leading-[1.15] text-muted">
              <span className="text-[34px]">{PRICE_COMPETITORS}</span>{' '}
              <span className="text-[15px] font-bold">{RIYAL}</span>
            </p>
            <ul className="mt-auto flex w-full flex-col gap-1.5">
              <Point icon="/icons/clock.svg">{competitors.points[0]}</Point>
              <Point icon="/icons/minus-circle.svg">{competitors.points[1]}</Point>
            </ul>
          </div>

        </RevealItem>

        <RevealItem className="mt-3 flex w-full items-center justify-between rounded-card border border-dashed border-pink/40 bg-pink/[0.08] px-4 py-3.5">
          <div className="flex flex-col items-start text-start">
            <p className="text-sm font-bold text-white">{savings.label}</p>
            <p className="text-[13px] text-body">{savings.sub}</p>
          </div>
          <SavingAmount className="text-2xl font-extrabold text-pink" />
        </RevealItem>

        <RevealItem className="mt-5 w-full">
          <Button className="w-full" onClick={(event) => openFlow(event.currentTarget)}>
            {cta}
          </Button>
        </RevealItem>
      </Reveal>

      {/* -------------------------------- desktop ------------------------------- */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="relative mx-auto hidden w-full max-w-[1280px] overflow-hidden rounded-sheet border border-[#784760] bg-gradient-to-r from-[#0a0a0b] to-[#120a0f] px-8 py-5 shadow-price-card lg:block"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[121px] -top-[121px] size-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(240,172,215,0.16),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[121px] -right-[121px] size-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(240,172,215,0.16),transparent)]"
        />

        <motion.div variants={item} className="relative flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-bold text-pink">{eyebrow}</p>
          <h2 className="text-[clamp(1.25rem,2.08vw,1.875rem)] font-extrabold leading-[1.2] text-white">{title}</h2>
        </motion.div>

        <motion.div variants={item} className="relative mt-6 flex items-stretch gap-4">
          {/* Competitors — the ٦٬١٩٩ figure is their pre-order price, never struck through. */}
          <div className="flex flex-1 flex-col gap-2 rounded-card-lg border border-[#2a2a2c] bg-surface p-4">
            <div className="flex h-10 flex-col items-start">
              <span className="inline-flex items-center rounded-pill border border-[#2a2a2c] bg-card px-3 py-1 text-[13px] font-bold text-[#a39d95]">
                {competitors.chipDesktop}
              </span>
              <p className="text-sm font-bold text-[#a39d95]">{competitors.tagline}</p>
            </div>
            <div className="flex flex-col items-start gap-1">
              <p className="text-[clamp(1.875rem,3.33vw,3rem)] font-extrabold leading-[1.2] text-[#8a847c]">
                {PRICE_COMPETITORS} {RIYAL}
              </p>
              <p className="text-[15px] text-[#a39d95]">{competitors.sub}</p>
            </div>
            <div className="mt-auto flex w-full items-center gap-2 rounded-[14px] border border-[#2a2a2c] bg-card px-3 py-2.5">
              <Image src="/icons/clock.svg" alt="" width={16} height={16} aria-hidden />
              <p className="text-[13px] text-[#a39d95]">{competitors.note}</p>
            </div>
          </div>
          {/* Wafi */}
          <SweepBorder className="flex-1">
            <div className="wafi-card-desktop flex h-full flex-col gap-2 rounded-[19px] p-4">
              <div className="flex h-10 flex-col items-start">
                <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/[0.08] px-3 py-1 text-[13px] font-bold text-white">
                  {wafi.chipDesktop}
                </span>
                <p className="text-sm font-bold text-pink">{wafi.tagline}</p>
              </div>
              <div className="flex flex-col items-start gap-1">
                <p className="text-[clamp(1.875rem,3.33vw,3rem)] font-extrabold leading-[1.2] text-white">
                  {PRICE_WAFI} {RIYAL}
                </p>
                <p className="text-[15px] text-[#c9dbec]">{wafi.sub}</p>
              </div>
              <Button
                variant="white"
                className="mt-auto h-10 w-full lg:text-[18px]"
                onClick={(event) => openFlow(event.currentTarget)}
              >
                {cta}
              </Button>
            </div>
          </SweepBorder>

          {/* Savings */}
          <div className="flex flex-1 flex-col gap-2 rounded-card-lg border border-pink bg-surface p-4">
            <div className="flex h-10 flex-col items-start">
              <span className="inline-flex items-center rounded-pill bg-[#361f2c] px-3 py-1 text-[13px] font-bold text-white">
                {savings.label}
              </span>
              <p className="text-sm font-bold text-pink">{savings.desktopTagline}</p>
            </div>
            <div className="flex flex-col items-start gap-1">
              <SavingAmount className="text-[clamp(1.875rem,3.33vw,3rem)] font-extrabold leading-[1.2] text-pink" />
              <p className="text-[15px] text-[#c9dbec]">{savings.city}</p>
            </div>
            <Button
              size="md"
              className="mt-auto h-10 w-full lg:text-[18px]"
              onClick={(event) => openFlow(event.currentTarget)}
            >
              {cta}
            </Button>
          </div>

        </motion.div>
      </motion.div>
    </section>
  );
}
