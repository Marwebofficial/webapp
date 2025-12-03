
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Nav } from '@/components/nav';
import { FirebaseClientProvider } from '@/firebase';
import { cn } from '@/lib/utils';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dataconnect-f35af.web.app';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const pageTitle = "DataConnect: Cheap Data, Airtime & TV Subs in Nigeria";
const pageDescription = "Get the cheapest data plans for MTN, Glo, Airtel, 9mobile. Buy cheap data, airtime, and pay TV subscriptions instantly on DataConnect Nigeria.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: pageTitle,
  description: pageDescription,
  keywords: ['cheap data', 'mtn cheap data', 'glo data plan', 'airtel data plan', '9mobile data plan', 'buy data nigeria', 'data connect', 'tv subscription', 'airtime to cash', 'cheap mtn data plan'],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: siteUrl,
    siteName: 'DataConnect Nigeria',
    images: [
      {
        url: `/logo.png`,
        width: 1200,
        height: 630,
        alt: 'DataConnect Nigeria Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [`${siteUrl}/logo.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preload" href="/fonts/pt-sans-v17-latin-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/pt-sans-v17-latin-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={cn('font-body antialiased h-full bg-background', ptSans.variable)}>
        <FirebaseClientProvider>
          <Nav />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
