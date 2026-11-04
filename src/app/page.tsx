'use client';

import { useEffect, useRef, useState } from 'react';
import { PurchaseFlowProvider } from '@/hooks/usePurchaseFlow';
import { Header } from '@/components/Header';
import { StickyBuyBar } from '@/components/StickyBuyBar';
import { PurchaseDialog } from '@/components/flow/PurchaseDialog';
import { PaymentResult } from '@/components/flow/PaymentResult';
import { Hero } from '@/components/sections/Hero';
import { PriceCompare } from '@/components/sections/PriceCompare';
import { Overview } from '@/components/sections/Overview';
import { Aperture } from '@/components/sections/Aperture';
import { Finishes } from '@/components/sections/Finishes';
import { Accessories } from '@/components/sections/Accessories';
import { PurchaseCard } from '@/components/sections/PurchaseCard';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { Footer } from '@/components/sections/Footer';

function Page() {
  const heroCtaRef = useRef<HTMLButtonElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const [heroCtaGone, setHeroCtaGone] = useState(false);
  const [finalCtaVisible, setFinalCtaVisible] = useState(false);

  // The sticky bar appears once the hero CTA scrolls away and hides again at
  // the final CTA, so the page never shows two competing buy buttons.
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    if (heroCtaRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => setHeroCtaGone(!entry.isIntersecting),
        { threshold: 0 },
      );
      observer.observe(heroCtaRef.current);
      observers.push(observer);
    }

    if (finalCtaRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => setFinalCtaVisible(entry.isIntersecting),
        { rootMargin: '0px 0px -40% 0px' },
      );
      observer.observe(finalCtaRef.current);
      observers.push(observer);
    }

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero ctaRef={heroCtaRef} />
        <PriceCompare />
        <Overview />
        <Aperture />
        <Finishes />
        <Accessories />
        <PurchaseCard />
        <Faq />
        <FinalCta sentinelRef={finalCtaRef} />
      </main>
      <Footer />
      <StickyBuyBar visible={heroCtaGone && !finalCtaVisible} />
      <PurchaseDialog />
      <PaymentResult />
    </>
  );
}

export default function Home() {
  return (
    <PurchaseFlowProvider>
      <Page />
    </PurchaseFlowProvider>
  );
}
