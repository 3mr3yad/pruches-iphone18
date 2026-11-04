'use client';

import { APERTURE } from '@/lib/content';
import { Reveal, RevealItem } from '../ui/Reveal';
import { OutlinedText } from '../ui/OutlinedText';
import { ApertureSvg } from '../ApertureSvg';

export function Aperture() {
  const copy = (variant: 'mobile' | 'desktop') => (
    <>
      <RevealItem
        as="p"
        className="w-full text-[13px] font-semibold text-pink lg:text-[clamp(1.1875rem,1.94vw,1.75rem)] lg:font-normal lg:leading-[1.35] lg:text-body"
      >
        <span id={variant === 'mobile' ? 'camera-title' : undefined}>{APERTURE.eyebrow}</span>
      </RevealItem>

      <RevealItem className="mt-2.5 w-full lg:mt-4">
        <h2 className="font-display text-[42px] font-extrabold leading-[1.15] text-white lg:text-[clamp(2.875rem,5.21vw,4.6875rem)] lg:leading-[1.2]">
          {APERTURE.titleSolid}
        </h2>
        <OutlinedText
          text={APERTURE.titleOutline}
          // Fluid on desktop so the line never outgrows the copy column.
          size={variant === 'mobile' ? '34px' : 'clamp(2.75rem,5.56vw,5rem)'}
          strokeWidth={variant === 'mobile' ? 1.25 : 1.6}
          align={variant === 'mobile' ? 'center' : 'start'}
        />
        <span className="sr-only">{APERTURE.titleOutline}</span>
      </RevealItem>
    </>
  );

  return (
    <section
      id="camera"
      aria-labelledby="camera-title"
      className="relative isolate overflow-hidden bg-bg px-gutter py-section lg:min-h-[700px] lg:bg-[#050505] lg:px-[62px] lg:py-[76px]"
    >
      <div
        aria-hidden
        className="glow-aperture animate-glow-pulse pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[660px] w-[700px] -translate-x-1/2 -translate-y-1/2 lg:w-[1525px]"
      />

      {/* Mobile: stacked and centred. */}
      <Reveal className="mobile-col flex flex-col items-center text-center lg:hidden">
        {copy('mobile')}
        <RevealItem className="mt-6 h-[222px] w-[230px]">
          <ApertureSvg className="h-full w-full" />
        </RevealItem>
        <RevealItem as="p" className="mt-[22px] w-full text-[15px] leading-[1.9] text-body">
          {APERTURE.copy}
        </RevealItem>
        <RevealItem className="mt-5 flex w-full flex-wrap items-start justify-center gap-2">
          {APERTURE.chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex h-9 items-center rounded-pill border border-line-2 px-3.5 text-[13px] font-semibold text-[#e8e4df]"
            >
              {chip}
            </span>
          ))}
        </RevealItem>
      </Reveal>

      {/* Desktop: copy on the right, aperture on the left. */}
      <Reveal className="mx-auto hidden max-w-[1316px] items-center gap-[30px] lg:flex">
        <div className="flex flex-1 flex-col items-start text-start">
          {copy('desktop')}
          <RevealItem as="p" className="mt-4 max-w-[714px] text-base leading-[1.35] text-body">
            {APERTURE.copy}
          </RevealItem>
          <RevealItem className="mt-12 flex items-start gap-3.5">
            {APERTURE.chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center justify-center rounded-pill border border-[#3a3a3c] px-[22px] py-2 text-center text-base leading-[1.35] text-body"
              >
                {chip}
              </span>
            ))}
          </RevealItem>
        </div>
        <RevealItem className="aspect-[437/420] h-auto w-[30.3vw] max-w-[437px] shrink-0">
          <ApertureSvg className="h-full w-full" />
        </RevealItem>
      </Reveal>
    </section>
  );
}
