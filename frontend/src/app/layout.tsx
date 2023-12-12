import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ColorModeScript } from '@chakra-ui/react';
import theme from './theme';

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
