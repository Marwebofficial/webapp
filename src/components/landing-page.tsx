
'use client';

import { useUser } from '@/firebase';
import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('./hero-section').then(mod => mod.HeroSection), { 
    loading: () => <div className="h-[600px] w-full bg-gray-200 animate-pulse" />
});
const AboutSection = dynamic(() => import('./about-section'), { 
    loading: () => <div className="h-96 w-full bg-gray-200 animate-pulse" /> 
});
const Testimonials = dynamic(() => import('./testimonials-section'), { 
    loading: () => <TestimonialsSkeleton />
});
const KeyFeaturesSection = dynamic(() => import('./key-features-section').then(mod => mod.KeyFeaturesSection), {
    loading: () => <div className="h-96 w-full bg-gray-200 animate-pulse" />
});
const SecuritySection = dynamic(() => import('./security-section').then(mod => mod.SecuritySection), {
    loading: () => <div className="h-64 w-full bg-gray-200 animate-pulse" />
});
const FutureUpdatesSection = dynamic(() => import('./future-updates-section').then(mod => mod.FutureUpdatesSection), {
    loading: () => <div className="h-96 w-full bg-gray-200 animate-pulse" />
});
const EngagementSection = dynamic(() => import('./engagement-section').then(mod => mod.EngagementSection), {
    loading: () => <div className="h-96 w-full bg-gray-200 animate-pulse" />
});

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
                <div className="h-60 w-full bg-gray-300 animate-pulse rounded-lg" />
                <div className="h-60 w-full bg-gray-300 animate-pulse rounded-lg" />
                <div className="h-60 w-full bg-gray-300 animate-pulse rounded-lg" />
              </div>
          </div>
        </section>
    )
}

export function LandingPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/account');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <>
      <HeroSection />
      <KeyFeaturesSection />
      <Suspense fallback={<div className="h-96 w-full bg-gray-200 animate-pulse" />}>
          <AboutSection />
      </Suspense>
      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>
      <SecuritySection />
      <FutureUpdatesSection />
      <EngagementSection />
    </>
  );
}
