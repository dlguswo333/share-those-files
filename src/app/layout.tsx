import type {Metadata} from 'next';
import {Roboto} from 'next/font/google';
import './globals.css';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  display: 'block',
  subsets: ['latin'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'share-those-files',
  description: 'Share files easily, simply.',
};

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable}`}>
        <AppRouterCacheProvider>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
