import type { Metadata } from 'next';
import { Inter, Bricolage_Grotesque, Geist_Mono, Noto_Sans_Devanagari, Imbue, Rozha_One } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { SplashScreen } from '@/components/ui/SplashScreen';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const imbue = Imbue({
  variable: '--font-imbue',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

const rozha = Rozha_One({
  variable: '--font-rozha',
  subsets: ['devanagari', 'latin'],
  weight: ['400'],
});

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const devanagari = Noto_Sans_Devanagari({
  variable: '--font-noto-devanagari',
  subsets: ['devanagari'],
  weight: ['500', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'HH GOA 2026 — Builder ID & Profile Frame Generator',
  description:
    'Generate your official Hacker House Goa 2026 Builder ID Card & Profile Frame. One upload turns you into an official HH Goa 2026 Builder. #FrameInGoa',
  keywords: [
    'Hacker House Goa',
    'HH Goa 2026',
    'Builder ID',
    'Profile Frame',
    'Goa India',
    'FrameInGoa',
    'Builder Pass',
    'ID Card Generator',
  ],
  openGraph: {
    title: 'HH GOA 2026 — Builder ID & Profile Frame Generator',
    description: 'Claim your official Hacker House Goa 2026 Builder ID & Profile Frame. #FrameInGoa',
    url: 'https://hhgoa.com',
    siteName: 'HH GOA 2026',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HH GOA 2026 — Builder ID & Profile Frame Generator',
    description: 'Claim your official Builder ID & Profile Frame. #FrameInGoa',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${imbue.variable} ${rozha.variable} ${bricolage.variable} ${geistMono.variable} ${devanagari.variable} h-full antialiased`}>
      <body className="bg-[#0B6B3A] text-[#FBF6E9] min-h-full flex flex-col font-mono selection:bg-[#FF007A] selection:text-white">
        <SplashScreen />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
