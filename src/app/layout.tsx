
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/firebase/provider";
import { Toaster } from "@/components/ui/toaster";
import Nav from "@/components/nav";
import Footer from "@/components/about-section";
import { siteConfig } from "@/lib/utils";
import { Metadata } from "next";
import ClientOnly from "@/components/ClientOnly";
import dynamic from "next/dynamic";

const FirebaseProvider = dynamic(() => import('../firebase/provider'), { ssr: false });


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Next.js", "React", "Tailwind CSS", "Server Components", "Radix UI"],
  authors: [
    {
      name: "shadcn",
      url: "https://shadcn.com",
    },
  ],
  creator: "shadcn",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientOnly>
            <FirebaseProvider>
              <Nav />
              {children}
              <Footer />
              <Toaster />
            </FirebaseProvider>
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}
