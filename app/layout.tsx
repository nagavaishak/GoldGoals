import type { Metadata } from 'next';
import { Bebas_Neue, Syne, Space_Mono } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GoldGoals — Save Together, Win Together',
  description: 'Turn savings goals into gold-backed social commitments. Powered by Oro GRAIL on Solana.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bebasNeue.variable} ${syne.variable} ${spaceMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
