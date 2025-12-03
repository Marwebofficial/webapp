
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Smartphone,
  ShieldCheck,
  Clock,
  Tv,
  Repeat,
} from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import React, { Suspense, lazy, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AboutSection = lazy(() => import('./about-section'));


export function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/account');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative w-full h-[80vh] flex items-center justify-center text-center bg-gray-50 dark:bg-gray-900">
          {heroImage && <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            priority
            className="object-cover -z-10 opacity-5"
            data-ai-hint={heroImage.imageHint}
          />}
          <div className="container px-4 md:px-6 z-10 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Instant Digital Services for Nigeria
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Cheap data, airtime top-ups, TV subscriptions, and more. Fast, reliable, and available 24/7.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" className="text-lg py-7 px-10 font-bold rounded-full shadow-lg transition-transform hover:scale-105">
                  <Link href="/signup">
                    Get Started
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-background/80 text-lg py-7 px-10 font-bold rounded-full shadow-lg transition-transform hover:scale-105">
                    <Link href="#features">Our Services</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                Why Choose Us?
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                The Smart Choice for Your Digital Needs
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We provide a seamless experience for all your mobile
                transactions, ensuring you get the best value for your money.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <FeatureCard
                icon={<Zap className="w-8 h-8 text-primary" />}
                title="Instant Delivery"
                description="Your data and subscriptions are delivered within minutes. No delays, no stories."
              />
              <FeatureCard
                icon={<Tv className="w-8 h-8 text-primary" />}
                title="TV Subscription"
                description="Renew your DSTV, GOtv, and StarTimes subscriptions instantly and never miss a show."
              />
              <FeatureCard
                icon={<Repeat className="w-8 h-8 text-primary" />}
                title="Airtime to Cash"
                description="Convert your unused airtime back to cash quickly and at the best rates."
              />
              <FeatureCard
                icon={<Smartphone className="w-8 h-8 text-primary" />}
                title="All Networks"
                description="We support all major Nigerian mobile networks: MTN, Glo, Airtel, and 9mobile."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                title="Secure & Reliable"
                description="Your transactions are safe with us. We provide a reliable service you can trust."
              />
              <FeatureCard
                icon={<Clock className="w-8 h-8 text-primary" />}
                title="24/7 Availability"
                description="Our service is available round the clock, any day of the week. Transact whenever you need to."
              />
            </div>
          </div>
        </section>

        <Suspense fallback={<AboutSkeleton />}>
            <AboutSection />
        </Suspense>

      </main>

      <footer className="w-full border-t bg-background">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 px-4 md:flex-row md:px-6">
            <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DataConnect Nigeria. All rights
            reserved.
            </p>
            <nav className="flex gap-4 sm:gap-6">
                <Link href="/terms-of-service" className="text-sm hover:underline underline-offset-4">
                    Terms
                </Link>
                <Link href="/privacy-policy" className="text-sm hover:underline underline-offset-4">
                    Privacy
                </Link>
                <Link href="/payment-policy" className="text-sm hover:underline underline-offset-4">
                    Payments
                </Link>
                <Link href="/contact" className="text-sm hover:underline underline-offset-4">
                    Contact
                </Link>
            </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-2 text-center">
      <div className="flex justify-center items-center mb-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function AboutSkeleton() {
    return (
         <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm mb-4">
                  About Us
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Your Trusted Partner in Digital Connectivity
                </h2>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden">
              </div>
            </div>
          </div>
        </section>
    )
}
