'use client';

import { FINAL_CTA, PRICE_WAFI, PRODUCT_NAME_LATIN, RIYAL } from '@/lib/content';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { Reveal, RevealItem } from '../ui/Reveal';
import { Button } from '../ui/Button';

export function FinalCta({ sentinelRef }: { sentinelRef?: React.RefObject<HTMLDivElement> }) {
  const { openFlow } = usePurchaseFlow();

  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-title"
      className="relative isolate overflow-hidden px-gutter pb-10 pt-16 lg:px-20 lg:pb-8 lg:pt-[35px]"
    >
      <div ref={sentinelRef} aria-hidden className="absolute inset-x-0 top-0 h-px" />
      <div
        aria-hidden
        className="glow-final-mobile animate-glow-pulse pointer-events-none absolute left-1/2 top-[180px] -z-10 h-[340px] w-[700px] -translate-x-1/2 lg:hidden"
      />
      <div
        aria-hidden
        className="glow-final pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[690px] lg:block"
      />

      <Reveal className="mobile-col flex flex-col items-center text-center lg:max-w-[1200px]">
        <RevealItem
          as="p"
          className="font-latin text-xl text-pink lg:text-[clamp(2rem,3.40vw,3.0625rem)] lg:font-extrabold lg:leading-[1.2] lg:text-[#945475]"
        >
          {PRODUCT_NAME_LATIN}
        </RevealItem>

        <RevealItem
          as="h2"
          className="mt-1 text-[34px] font-extrabold leading-[1.35] text-white lg:mt-2 lg:text-[clamp(2.875rem,5.21vw,4.6875rem)] lg:leading-[1.6]"
        >
          <span id="final-cta-title">{FINAL_CTA.title}</span>
        </RevealItem>

        <RevealItem as="p" className="mt-2.5 text-[15px] text-body lg:mt-6 lg:text-[clamp(1.25rem,2.08vw,1.875rem)] lg:leading-[1.35] lg:text-white">
          {FINAL_CTA.priceLead}
          <strong className="font-bold text-white lg:text-[clamp(1.3125rem,2.22vw,2rem)]">
            {PRICE_WAFI} {RIYAL}
          </strong>
        </RevealItem>

        <RevealItem className="mt-[22px] w-full lg:mt-6 lg:w-[372px]">
          <Button size="lg" className="w-full" onClick={(event) => openFlow(event.currentTarget)}>
            {FINAL_CTA.cta}
          </Button>
        </RevealItem>
      </Reveal>
    </section>
  );
}
