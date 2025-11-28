import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Nav } from '@/components/nav';
import { FirebaseClientProvider } from '@/firebase';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

export const metadata: Metadata = {
  title: 'DataConnect Nigeria',
  description: 'Buy mobile data plans in Nigeria quickly and easily.',
  openGraph: {
    title: 'DataConnect Nigeria',
    description: 'Instant Data, Airtime & Cash Conversion in Nigeria.',
    url: siteUrl,
    siteName: 'DataConnect Nigeria',
    images: [
      {
        url: `${siteUrl}/logo.png`,
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
    title: 'DataConnect Nigeria',
    description: 'Instant Data, Airtime & Cash Conversion in Nigeria.',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased h-full bg-background">
        <FirebaseClientProvider>
          <Nav />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
