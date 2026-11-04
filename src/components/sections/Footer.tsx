'use client';

import Image from 'next/image';
import { FOOTER, FOOTER_LINKS } from '@/lib/content';
import { Reveal, RevealItem } from '../ui/Reveal';

export function Footer() {
  return (
    <footer className="border-t border-line px-gutter pb-10 pt-7 lg:border-[#2a2a2c] lg:px-20 lg:py-6">
      <Reveal
        as="div"
        className="mobile-col flex flex-col items-start gap-3.5 lg:max-w-[1280px] lg:flex-row lg:items-center lg:justify-between lg:gap-8"
      >
        <RevealItem className="shrink-0">
          <Image
            src="/icons/logo-white.svg"
            alt="عالم وافي"
            width={118}
            height={24}
            className="h-6 w-auto lg:h-7"
          />
        </RevealItem>

        <RevealItem as="div" className="w-full lg:w-auto">
          <nav aria-label="روابط التذييل">
            <ul className="flex flex-wrap items-start gap-x-[18px] gap-y-2 text-[13px] text-body lg:gap-x-8 lg:text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center transition-colors duration-200 ease-quint hover:text-white lg:min-h-0 lg:min-w-0"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </RevealItem>

        <RevealItem
          as="p"
          className="min-w-full text-[12.5px] leading-[1.7] text-muted lg:min-w-0 lg:shrink-0 lg:text-sm lg:text-[#8a847c]"
        >
          {FOOTER.copyright}
        </RevealItem>
      </Reveal>
    </footer>
  );
}
