import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BUILD DNA — Hacker House Goa 2026',
  description:
    'A generative identity engine that turns a builder photo, stack, and build personality into a unique Hacker House Goa 2026 Builder Identity.',
  keywords: [
    'Hacker House Goa',
    'HH Goa 2026',
    'Builder DNA',
    'Goa India',
    'FrameInGoa',
    'Generative Art',
    'Builder ID',
  ],
  openGraph: {
    title: 'BUILD DNA — Hacker House Goa 2026',
    description: 'Turn your stack and build energy into a unique Hacker House Goa 2026 Builder Identity.',
    url: 'https://hhgoa.com',
    siteName: 'BUILD DNA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BUILD DNA — Hacker House Goa 2026',
    description: 'Turn your stack and build energy into a unique Builder Identity. #FrameInGoa',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="bg-[#050506] text-white min-h-full flex flex-col font-mono selection:bg-[#00FF66] selection:text-black">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
