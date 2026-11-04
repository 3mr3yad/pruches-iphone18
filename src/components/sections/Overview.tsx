'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { OVERVIEW, SPECS } from '@/lib/content';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { Reveal, RevealItem } from '../ui/Reveal';
import { CountUp } from '../ui/CountUp';


export function Overview() {
  const { reduced } = useMotionPrefs();
  const cameraRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cameraRef,
    offset: ['start end', 'end start'],
  });
  // The ghost word drifts ~40px while the close-up scales up a touch.
  const ghostX = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const imageScale = useTransform(scrollYProgress, [0, 0.6], [0.94, 1]);

  return (
    <section
      id="specs"
      aria-labelledby="specs-title"
      className="flex flex-col items-center px-gutter pb-10 pt-section lg:px-0 lg:pb-0 lg:pt-14"
    >
      <Reveal className="mobile-col flex flex-col items-center text-center">
        <RevealItem as="p" className="w-full text-[13px] font-semibold text-pink lg:text-2xl lg:font-normal lg:text-body">
          <span id="specs-title">{OVERVIEW.eyebrow}</span>
        </RevealItem>
        <RevealItem
          as="p"
          className="mt-3 w-full text-[15px] leading-[1.9] text-body lg:mt-[22px] lg:max-w-[824px] lg:text-base lg:leading-[1.35]"
        >
          {OVERVIEW.paragraph}
        </RevealItem>
      </Reveal>

      {/* Camera close-up over the ghost word */}
      <div
        ref={cameraRef}
        className="mobile-col relative mt-7 aspect-[350/330] lg:mt-[22px] lg:aspect-[1440/641] lg:overflow-hidden"
      >
        {/*
          Centring is done by layout, not by a `-translate-x-1/2` class: motion
          writes its own `transform` for `x`/`scale`, which would overwrite it.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex justify-center pt-[37%] lg:pt-[200px]"
        >
          {/*
            The fade comes from `opacity` on the element, not from a
            semi-transparent text colour. A translucent colour composites each
            glyph on its own, so wherever Arabic letterforms overlap the alpha
            stacks and shows as brighter patches inside the word; element
            opacity flattens the text first and fades it as one layer.
          */}
          <motion.p
            style={reduced ? undefined : { x: ghostX }}
            className="whitespace-nowrap font-display text-[46px] font-extrabold leading-none text-white opacity-10 sm:text-[78px] lg:text-[clamp(6.875rem,13.19vw,11.875rem)] lg:leading-[1.08] lg:opacity-[0.13]"
          >
            {OVERVIEW.ghostWord}
          </motion.p>
        </div>
        <motion.div
          style={reduced ? undefined : { scale: imageScale }}
          // Figma: a 330x310 image inside a 350x330 box, kept proportional.
          className="absolute inset-x-0 top-[3%] mx-auto aspect-[330/310] h-auto w-[94.28%] lg:top-0 lg:aspect-auto lg:h-[93.6%] lg:w-[44.44%]"
        >
          <Image
            src="/images/camera-closeup.webp"
            alt="لقطة قريبة لنظام الكاميرا الخلفي"
            width={640}
            height={600}
            sizes="(max-width: 1023px) 566px, 640px"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 hidden h-[201px] bg-gradient-to-b from-transparent to-black lg:block"
        />
      </div>

      {/* Specs — 2×2 on mobile, four columns from lg */}
      <Reveal
        className="mobile-col mt-5 grid auto-rows-fr grid-cols-2 gap-px overflow-hidden rounded-card-lg border border-line-2 bg-line-2 lg:mt-[22px] lg:grid-cols-4 lg:gap-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-20"
        stagger={0.1}
      >
        {SPECS.map((spec) => (
          <RevealItem
            key={spec.labelEn}
            // Mobile: right-aligned Arabic 2x2. Desktop: left-aligned English row,
            // so the alignment and the order both flip at lg.
            className={`flex flex-col items-start gap-2.5 bg-[#050505] px-4 py-[18px] text-start lg:h-[clamp(9rem,13.9vw,12.5rem)] lg:items-end lg:justify-between lg:border lg:border-[#222224] lg:bg-black lg:p-8 lg:text-end ${spec.mobileOrder} ${spec.lgOrder}`}
          >
            {/*
              Two separate values rather than two suffix spans: `dir="auto"`
              resolves from text content even inside a `display:none` span, so
              a hidden Arabic suffix would flip the English tile to RTL and
              render "HRS 45".
            */}
            <p className="font-num text-[40px] leading-none text-white lg:hidden">
              <CountUp
                to={spec.to}
                decimals={spec.decimals}
                suffix={spec.suffix}
                className="tabular-nums"
              />
            </p>
            <p
              dir="ltr"
              // `text-start` is relative to this element's own dir, so with
              // dir="ltr" it lands on the physical left, as the frame has it.
              className="hidden font-num text-[clamp(2.875rem,5.00vw,4.5rem)] leading-none text-white lg:block lg:text-start"
            >
              <CountUp
                to={spec.to}
                decimals={spec.decimals}
                suffix={spec.suffixEn}
                className="tabular-nums"
              />
            </p>
            <p className="min-w-full text-xs leading-[1.6] text-body lg:hidden">{spec.label}</p>
            <p
              dir="ltr"
              className="hidden min-w-full text-xs uppercase leading-[1.6] tracking-[0.04em] text-[#a39d95] lg:block lg:text-start"
            >
              {spec.labelEn}
            </p>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}
