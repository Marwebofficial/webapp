
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Smartphone,
  ShieldCheck,
  Tv,
  Repeat,
  ArrowRight,
  GraduationCap,
  BrainCircuit,
  BookOpen,
} from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AboutSection from './about-section';
import Testimonials from './testimonials-section';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

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

export function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-connect');
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Main Banner */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
             <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
                <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(var(--primary-rgb),0.15),rgba(255,255,255,0))]"></div>
                <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(var(--primary-rgb),0.15),rgba(255,255,255,0))]"></div>
             </div>

          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-gray-900 dark:text-gray-100">
                    Your Digital Life, Connected & Empowered.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Instantly buy cheap data, pay bills, and access AI-powered educational tools. DataConnect is your all-in-one platform for seamless digital living in Nigeria.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Button asChild size="lg" className="group shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    <Link href="/signup">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
                 <div className="flex items-center gap-4 pt-2">
                    <div className="flex -space-x-2 overflow-hidden">
                        <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                            <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="User 1" />
                            <AvatarFallback>U1</AvatarFallback>
                        </Avatar>
                        <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                            <AvatarImage src="https://i.pravatar.cc/150?img=2" alt="User 2" />
                            <AvatarFallback>U2</AvatarFallback>
                        </Avatar>
                         <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                            <AvatarImage src="https://i.pravatar.cc/150?img=3" alt="User 3" />
                            <AvatarFallback>U3</AvatarFallback>
                        </Avatar>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Join 5,000+ happy users</p>
                </div>
              </div>
              <div className="relative group hidden lg:block">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative aspect-video mx-auto overflow-hidden rounded-xl sm:w-full shadow-2xl">
                     {heroImage && <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        fill
                        priority
                        className="object-cover"
                        data-ai-hint={heroImage.imageHint}
                    />}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Your All-in-One Platform
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                From essential digital services to groundbreaking AI learning tools, we've got you covered.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <FeatureCard
                icon={<Smartphone className="w-8 h-8 text-primary" />}
                title="Data Solutions"
                description="Instantly buy cheap data, top up airtime, and manage your TV subscriptions for all major Nigerian providers."
              />
              <FeatureCard
                icon={<BrainCircuit className="w-8 h-8 text-primary" />}
                title="Advanced AI Tools"
                description="Experience our powerful AI integrations designed to streamline your tasks and enhance your productivity."
              />
              <FeatureCard
                icon={<GraduationCap className="w-8 h-8 text-primary" />}
                title="Educational Resources"
                description="Get ready for AI-powered tutoring, access to past questions, and comprehensive exam preparation tools. (Coming Soon!)"
              />
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <Suspense fallback={<div className="h-96 w-full bg-gray-200 animate-pulse" />}>
            <AboutSection />
        </Suspense>

        {/* Trust Builders Section */}
        <Suspense fallback={<TestimonialsSkeleton />}>
          <Testimonials />
        </Suspense>
        
        <section id="security" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                        Security and Privacy You Can Trust
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        We are committed to protecting your data. Our platform is built with robust security measures and a strict privacy policy to ensure your information is always safe.
                    </p>
                </div>
                 <div className="flex justify-center">
                     <Button asChild variant="outline">
                        <Link href="/privacy-policy">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Read Our Privacy Policy
                        </Link>
                    </Button>
                </div>
            </div>
        </section>


        {/* Future Updates Section */}
        <section id="ai-tools" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm text-primary font-semibold">
                Coming Soon
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                The Future of Learning is Here
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                We're building a suite of AI-powered tools to revolutionize the way you learn and prepare for exams.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FutureFeatureCard
                icon={<BrainCircuit className="w-8 h-8 text-primary" />}
                title="Personalized AI Tutor"
                description="Get instant, one-on-one help with complex subjects, tailored to your learning style."
              />
              <FutureFeatureCard
                icon={<BookOpen className="w-8 h-8 text-primary" />}
                title="Interactive Exam Prep"
                description="Access a vast library of past questions and get real-time feedback on your performance."
              />
              <FutureFeatureCard
                icon={<GraduationCap className="w-8 h-8 text-primary" />}
                title="Goal-Oriented Learning"
                description="Set your academic goals and let our AI create a customized study plan to help you succeed."
              />
            </div>
          </div>
        </section>

        {/* Engagement Section */}
        <section id="blog" className="w-full py-12 md:py-24 lg:py-32">
             <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                 <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                        Stay Informed and Inspired
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Check out our blog for industry trends, educational tips, and platform updates.
                    </p>
                </div>
                <div className="flex justify-center">
                     <Button asChild size="lg">
                        <Link href="/blog">
                            Read The Blog <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
                 <div className="w-full max-w-sm space-y-2 mx-auto mt-8">
                    <form className="flex space-x-2">
                        <Input type="email" placeholder="Enter your email" className="max-w-lg flex-1" />
                        <Button type="submit">Subscribe</Button>
                    </form>
                    <p className="text-xs text-muted-foreground">Sign up for our newsletter to get the latest updates.</p>
                </div>
             </div>
        </section>

      </main>

      <footer className="w-full border-t bg-secondary/50 text-foreground">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 py-12 px-4 md:px-6">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">DataConnect</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Empowering your digital and educational journey in Nigeria.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-3">
            <div className="space-y-3">
              <h4 className="font-semibold tracking-wide">Quick Links</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="#features" className="text-sm text-muted-foreground hover:text-primary">Features</Link>
                <Link href="/buy-data" className="text-sm text-muted-foreground hover:text-primary">Buy Data</Link>
                <Link href="/buy-airtime" className="text-sm text-muted-foreground hover:text-primary">Buy Airtime</Link>
                <Link href="/tv-subscription" className="text-sm text-muted-foreground hover:text-primary">TV Subscription</Link>
              </nav>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold tracking-wide">Company</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="#about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link>
              </nav>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold tracking-wide">Legal</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
                <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                <Link href="/payment-policy" className="text-sm text-muted-foreground hover:text-primary">Payment Policy</Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="border-t">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-4 md:px-6">
                 <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} DataConnect Nigeria. All rights reserved.
                </p>
            </div>
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
    <div className="grid gap-4 p-6 rounded-xl border bg-background/50 shadow-md hover:shadow-lg transition-shadow">
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

function FutureFeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
    return (
        <Card className="text-center p-6 border-0 shadow-lg bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <CardHeader className="items-center p-0">
                 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {icon}
                </div>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4">
                <p className="text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

    

    