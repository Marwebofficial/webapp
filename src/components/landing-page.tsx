
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Zap,
  Smartphone,
  ShieldCheck,
  Clock,
  Phone,
  Repeat,
  Tv,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import { ReviewFormDialog } from './review-form-dialog';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Testimonials = lazy(() => import('./testimonials-section'));
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
        <section className="relative w-full h-[80vh] flex items-center justify-center text-center bg-gradient-to-r from-primary/10 to-accent/10">
          {heroImage && <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            priority
            className="object-cover -z-10 opacity-20"
            data-ai-hint={heroImage.imageHint}
          />}
          <div className="container px-4 md:px-6 z-10 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Cheap Data, Instant Airtime & TV Subs
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Stay connected with the cheapest mobile data plans, airtime top-ups,
                TV subscriptions, and easily convert airtime to cash. Delivered in
                minutes, 24/7.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link href="/buy-data" passHref>
                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-7 px-10 font-bold rounded-full shadow-lg transition-transform hover:scale-105"
                  >
                    Buy Data
                  </Button>
                </Link>
                <Link href="/buy-airtime" passHref>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-background/80 text-lg py-7 px-10 font-bold rounded-full shadow-lg transition-transform hover:scale-105"
                  >
                    Buy Airtime
                  </Button>
                </Link>
                <Link href="/tv-subscription" passHref>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-primary/10 border-primary/20 text-lg py-7 px-10 font-bold rounded-full shadow-lg transition-transform hover:scale-105"
                  >
                    TV Subscription
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Why Choose DataConnect?
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
                description="Your data is delivered to your phone number within minutes of purchase. No delays, no stories."
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

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} DataConnect Nigeria. All rights
          reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="/terms-of-service" className="text-xs hover:underline underline-offset-4">
                Terms of Service
            </Link>
             <Link href="/privacy-policy" className="text-xs hover:underline underline-offset-4">
                Privacy Policy
            </Link>
             <Link href="/payment-policy" className="text-xs hover:underline underline-offset-4">
                Payment Policy
            </Link>
            <Link href="/contact" className="text-xs hover:underline underline-offset-4">
                Contact Us
            </Link>
        </nav>
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
    <div className="grid gap-1 text-center">
      <div className="flex justify-center items-center mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
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
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-4/5" />
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>
            </div>
          </div>
        </section>
    )
}

    
