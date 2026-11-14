import type { Metadata, Viewport } from 'next';
/* Fonts are bundled from @fontsource (served from our own domain) rather than
   fetched from Google at build time: next/font/google fails the whole build
   whenever that request flakes, which broke Cloudflare deploys. Each weight
   file carries unicode-range, so browsers download only the Arabic/Latin
   subsets a page actually uses. The CSS variables are set in globals.css. */
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/changa/800.css';
import '@fontsource/anton/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'iPhone 18 Pro Max — استلام فوري من عالم وافي',
  description:
    'آيفون 18 برو ماكس بسعر ٥٬٩٩٩ ريال مع استلام فوري من فروع عالم وافي في الرياض، أو توصيل لباب البيت.',
  other: { 'format-detection': 'telephone=no' },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans text-white antialiased">{children}</body>
    </html>
  );
}
