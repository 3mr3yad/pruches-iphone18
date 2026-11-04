'use client';

import Image from 'next/image';
import { PRODUCT_NAME_LATIN, PURCHASE_CARD } from '@/lib/content';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { Reveal, RevealItem } from '../ui/Reveal';
import { Button } from '../ui/Button';

export function PurchaseCard() {
  const { openFlow } = usePurchaseFlow();

  return (
    <section
      id="order"
      aria-labelledby="order-title"
      className="px-gutter pb-section pt-2 lg:px-20 lg:py-12"
    >
      <Reveal className="mobile-col flex flex-col lg:max-w-[1040px] overflow-hidden rounded-card-xl border border-line bg-gradient-to-b from-[#140c11] to-surface lg:flex-row lg:items-stretch lg:rounded-sheet lg:border-modal-line lg:bg-modal-bg lg:bg-none lg:shadow-modal">
        {/* Portrait: on top at mobile, on the left at lg — hence lg:order-2 in RTL. */}
        <RevealItem className="relative h-[300px] w-full shrink-0 overflow-hidden bg-black lg:order-2 lg:h-[624px] lg:w-[32.2vw] lg:max-w-[464px] lg:bg-modal-rail">
          <Image
            src="/images/hero.webp"
            alt="آيفون 18 برو ماكس"
            width={1440}
            height={960}
            sizes="(max-width: 1023px) 100vw, 464px"
            /* Figma 463:794 (350x313.8 at top -6.9) and 463:560 (696x624 at left -116). */
            className="absolute left-0 top-[-2.3%] h-[104.6%] w-full max-w-none object-cover lg:left-[-25%] lg:top-0 lg:h-full lg:w-[150%]"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 start-0 hidden w-28 bg-gradient-to-r from-transparent to-modal-bg lg:block"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-modal-rail"
          />
          <p className="absolute inset-x-0 bottom-7 text-center font-latin text-[10px] tracking-[3px] text-[#cfc6cc] lg:bottom-[52px] lg:text-xs lg:text-pink">
            {PURCHASE_CARD.kicker}
          </p>
        </RevealItem>

        {/* Copy */}
        <div className="flex flex-1 flex-col items-center p-gutter text-center lg:order-1 lg:items-start lg:justify-center lg:px-12 lg:py-10 lg:text-start">
          <RevealItem className="inline-flex h-7 items-center gap-1.5 rounded-pill border border-pink/25 bg-pink/[0.12] px-3 lg:border-modal-line lg:bg-plum lg:px-3.5 lg:py-1.5">
            <span className="text-xs font-bold text-pink lg:text-[13px] lg:font-semibold">
              {PURCHASE_CARD.chip}
            </span>
            <Image src="/icons/dot.svg" alt="" width={6} height={6} aria-hidden />
          </RevealItem>

          <RevealItem
            as="p"
            className="mt-2.5 font-latin text-[17px] text-pink lg:mt-6 lg:text-[clamp(1.3125rem,2.22vw,2rem)] lg:tracking-[-0.8px]"
          >
            {PRODUCT_NAME_LATIN}
          </RevealItem>

          <RevealItem
            as="h2"
            className="text-[32px] font-extrabold leading-[1.3] text-white lg:text-[clamp(2.625rem,4.58vw,4.125rem)] lg:leading-[1.45]"
          >
            <span id="order-title">{PURCHASE_CARD.title}</span>
          </RevealItem>

          <RevealItem
            as="p"
            className="mt-1 w-full text-sm leading-[1.9] text-body lg:mt-2 lg:text-[17px] lg:text-modal-body"
          >
            {PURCHASE_CARD.copy}
          </RevealItem>

          <RevealItem className="mt-[18px] w-full lg:mt-6">
            <Button
              size="lg"
              className="w-full"
              onClick={(event) => openFlow(event.currentTarget)}
            >
              {PURCHASE_CARD.cta}
            </Button>
          </RevealItem>

          <RevealItem as="p" className="mt-2.5 w-full text-center text-[12.5px] text-muted lg:mt-4 lg:text-xs">
            {PURCHASE_CARD.note}
          </RevealItem>
        </div>
      </Reveal>
    </section>
  );
}
