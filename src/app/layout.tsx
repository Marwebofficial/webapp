
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Nav } from '@/components/nav';
import { FirebaseClientProvider } from '@/firebase';
import { cn } from '@/lib/utils';
import Script from 'next/script';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dataconnectnigeria.vercel.app';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
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
        <meta name="google-site-verification" content="1T_nRhGns7iADI6RuRUEPO5cHXYxC6iAw-7sSAa2bHI" />
      </head>
      <body className={cn('font-body antialiased h-full bg-background', ptSans.variable)}>
        <FirebaseClientProvider>
          <Nav />
          {children}
          <Toaster />
        </FirebaseClientProvider>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-YW766Q51T3" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-YW766Q51T3');
          `}
        </Script>
      </body>
    </html>
  );
}
