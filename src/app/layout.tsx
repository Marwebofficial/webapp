
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import { siteConfig } from "@/lib/utils";
import { Metadata, Viewport } from "next";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { Footer } from "@/components/footer";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Dataconnect Nigeria",
    template: `%s | ${"Dataconnect Nigeria"}`,
  },
  description: siteConfig.description,
  keywords: ["buy data Nigeria", "cheap data plans", "MTN data", "Glo data", "Airtel data", "9mobile data", "buy airtime Nigeria", "sell airtime for cash", "data reseller Nigeria", "VTU portal Nigeria", "how to buy cheap data in Nigeria", "best data plans Nigeria", "MTN cheap data code", "Glo cheap data code", "Airtel cheap data code", "9mobile cheap data code", "data subscription Nigeria", "airtime to cash converter", "VTU business in Nigeria", "data reselling website", "cheap internet data plans", "mobile data Nigeria"],
  authors: [
    {
      name: "shadcn",
      url: "https://shadcn.com",
    },
  ],
  creator: "shadcn",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "Dataconnect Nigeria",
    description: siteConfig.description,
    siteName: "Dataconnect Nigeria",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dataconnect Nigeria",
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: "@shadcn",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <FirebaseErrorListener />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
