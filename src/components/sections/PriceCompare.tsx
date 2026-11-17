'use client';

import { motion } from 'motion/react';
import { EASE, fadeUp, flat, inView } from '@/lib/motion';
import { useMemo } from 'react';
import { EDITIONS, PRICE_COMPARE, PRICE_SAVING, RIYAL } from '@/lib/content';
import { formatHalalas } from '@/lib/format';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { Reveal, RevealItem } from '../ui/Reveal';
import { Button } from '../ui/Button';

const { eyebrow, title, wafi, partner, savings, cta } = PRICE_COMPARE;

/**
 * Each edition's 256GB price: the lowest the order API sells it for, else the
 * fallback in EDITIONS (before the catalog loads, or if it fails).
 */
function useEditionPrices() {
  const { variants } = usePurchaseFlow();
  return useMemo(
    () =>
      EDITIONS.map((edition) => {
        const prices = variants
          .filter((v) => v.edition === edition.id && v.storage_label === '256GB')
          .map((v) => v.price);
        return {
          id: edition.id,
          label: `${wafi.editionPrefix} ${edition.short}`,
          warranty: edition.warranty,
          price: prices.length ? Math.min(...prices) : edition.price,
        };
      }),
    [variants],
  );
}

type EditionPrice = ReturnType<typeof useEditionPrices>[number];

/** Opens the purchase flow with this edition already picked. */
function useBuyEdition() {
  const { openFlow, setField } = usePurchaseFlow();
  return (edition: EditionPrice, trigger: HTMLElement) => {
    setField({ edition: edition.id });
    openFlow(trigger);
  };
}

/** An Awfal card for one edition (mobile / md). */
function EditionCardMobile({ edition }: { edition: EditionPrice }) {
  const buy = useBuyEdition();
  return (
    <SweepBorder className="flex-1">
      <div className="wafi-card flex h-full flex-col items-start gap-1.5 rounded-[19px] p-4">
        <span className="inline-flex h-6 items-center rounded-pill bg-white px-2.5 text-[11px] font-bold text-[#050505]">
          {wafi.chip}
        </span>
        <p className="mt-1 text-xs text-body">{wafi.name}</p>
        <p className="text-[13px] font-bold text-white">{edition.label}</p>
        <p className="font-extrabold leading-[1.15] text-white">
          <span className="text-[30px]">{formatHalalas(edition.price)}</span>{' '}
          <span className="text-[14px] font-bold">{RIYAL}</span>
        </p>
        <p className="text-[11px] text-muted">{edition.warranty}</p>
        <button
          type="button"
          onClick={(event) => buy(edition, event.currentTarget)}
          className="mt-auto min-h-10 w-full rounded-pill bg-white text-[13px] font-bold text-[#050505]"
        >
          {cta}
        </button>
      </div>
    </SweepBorder>
  );
}

/** An Awfal card for one edition (desktop). */
function EditionCardDesktop({ edition }: { edition: EditionPrice }) {
  const buy = useBuyEdition();
  return (
    <SweepBorder className="flex-1">
      <div className="wafi-card-desktop flex h-full flex-col gap-2 rounded-[19px] p-4">
        <div className="flex h-10 flex-col items-start">
          <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/[0.08] px-3 py-1 text-[13px] font-bold text-white">
            {wafi.chipDesktop}
          </span>
          <p className="text-sm font-bold text-pink">{wafi.tagline}</p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <p className="text-[15px] font-bold text-white">
            {edition.label} <span className="font-normal text-[#c9dbec]">· {edition.warranty}</span>
          </p>
          <p className="text-[clamp(1.75rem,2.9vw,2.75rem)] font-extrabold leading-[1.2] text-white">
            {formatHalalas(edition.price)} {RIYAL}
          </p>
          <p className="text-[15px] text-[#c9dbec]">{wafi.sub}</p>
        </div>
        <Button
          variant="white"
          className="mt-auto h-10 w-full lg:text-[18px]"
          onClick={(event) => buy(edition, event.currentTarget)}
        >
          {cta}
        </Button>
      </div>
    </SweepBorder>
  );
}

/** «عالم وافي — شريك النجاح»: who the pickup branches belong to. */
function PartnerNote({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-center gap-2 text-[13px] text-body ${className}`}>
      <span className="inline-flex shrink-0 items-center rounded-pill border border-pink/40 bg-pink/[0.1] px-2.5 py-0.5 text-[11px] font-bold text-pink">
        {partner.badge}
      </span>
      <span>{partner.text}</span>
    </p>
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
  const editions = useEditionPrices();

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

        {/* RTL: Middle East on the right, International on the left. */}
        <RevealItem className="mt-6 flex w-full items-stretch gap-3">
          {editions.map((edition) => (
            <EditionCardMobile key={edition.id} edition={edition} />
          ))}
        </RevealItem>


        <RevealItem className="mt-3 flex w-full items-center justify-between rounded-card border border-dashed border-pink/40 bg-pink/[0.08] px-4 py-3.5">
          <div className="flex flex-col items-start text-start">
            <p className="text-sm font-bold text-white">{savings.label}</p>
            <p className="text-[13px] text-body">{savings.sub}</p>
          </div>
          <SavingAmount className="text-2xl font-extrabold text-pink" />
        </RevealItem>

        <RevealItem className="mt-3 w-full">
          <PartnerNote />
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
          {/* Awfal — one card per edition; RTL puts Middle East on the right. */}
          {editions.map((edition) => (
            <EditionCardDesktop key={edition.id} edition={edition} />
          ))}

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

        <motion.div variants={item} className="relative mt-4 flex justify-center">
          <PartnerNote />
        </motion.div>
      </motion.div>
    </section>
  );
}
