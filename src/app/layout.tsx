import type { Metadata, Viewport } from 'next';
import { Anton, Cairo, Changa, Poppins } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-cairo',
});

const changa = Changa({
  subsets: ['arabic', 'latin'],
  weight: ['800'],
  display: 'swap',
  variable: '--font-changa',
});

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-anton',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'iPhone 18 Pro Max — استلام فوري من عالم وافي',
  description:
    'آيفون 18 برو ماكس بسعر ٥٬٩٩٩ ريال مع استلام فوري من فروع عالم وافي في الرياض، أو توصيل لباب البيت.',
  other: { 'format-detection': 'telephone=no' },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${changa.variable} ${anton.variable} ${poppins.variable}`}
    >
      <body className="bg-bg font-sans text-white antialiased">{children}</body>
    </html>
  );
}
