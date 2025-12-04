
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
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import React, { Suspense, lazy, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AboutSection = lazy(() => import('./about-section'));
const Testimonials = lazy(() => import('./testimonials-section'));


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
        <section className="relative w-full h-[90vh] flex items-center justify-center text-center">
           {heroImage && <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            priority
            className="object-cover -z-10 opacity-20"
            data-ai-hint={heroImage.imageHint}
          />}
           <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          <div className="container px-4 md:px-6 z-10 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-4">
                    Fast, Reliable, and Affordable
                </div>
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Instant Digital Services for Nigeria
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of satisfied customers. Get the cheapest data, airtime top-ups, TV subscriptions, and more. 24/7 service you can trust.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" className="text-lg py-7 px-10 font-bold rounded-full shadow-lg transition-transform hover:scale-105">
                  <Link href="/signup">
                    Get Started Now
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-lg py-7 px-10 font-bold rounded-full transition-transform hover:scale-105">
                    <Link href="#features">
                        Our Services <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
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
                description="Your data, airtime and subscriptions are delivered within minutes. No delays, no stories."
              />
              <FeatureCard
                icon={<Smartphone className="w-8 h-8 text-primary" />}
                title="Data & Airtime"
                description="Get the best rates for data bundles and airtime top-up on all major Nigerian networks."
              />
              <FeatureCard
                icon={<Tv className="w-8 h-8 text-primary" />}
                title="TV Subscription"
                description="Renew your DSTV, GOtv, and StarTimes subscriptions instantly and never miss a show."
              />
              <FeatureCard
                icon={<Repeat className="w-8 h-8 text-primary" />}
                title="Airtime to Cash"
                description="Convert your unused airtime back to cash quickly and at competitive rates."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                title="Secure & Reliable"
                description="Your transactions are protected with industry-standard security. A reliable service you can trust."
              />
              <FeatureCard
                icon={<Clock className="w-8 h-8 text-primary" />}
                title="24/7 Availability"
                description="Our automated service is available round the clock. Transact anytime you need to."
              />
            </div>
          </div>
        </section>

        <Suspense fallback={<AboutSkeleton />}>
            <AboutSection />
        </Suspense>

        <Suspense fallback={<TestimonialsSkeleton />}>
          <Testimonials />
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
    <div className="grid gap-4 p-6 rounded-lg hover:bg-card transition-colors border border-transparent hover:border-border">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
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

function TestimonialsSkeleton() {
    return (
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                    Testimonials
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    What Our Customers Say
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Hear from our satisfied customers who trust DataConnect for their digital needs.
                </p>
            </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="h-60 w-full" />
                <div className="h-60 w-full" />
                <div className="h-60 w-full" />
              </div>
          </div>
        </section>
    )
}
