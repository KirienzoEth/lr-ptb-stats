import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import Footer from './footer';
import Breadcrumbs from './Breadcrumbs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LooksRare stats',
  description: 'visualize data on the usage of the LooksRare apps',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Breadcrumbs />
          {children}
          <Analytics />
          <SpeedInsights />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
