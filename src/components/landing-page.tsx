
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
  Wallet,
  UserPlus,
  Smile,
  Heart,
  Clock,
  ThumbsUp,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import React, { Suspense, lazy, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AboutSection from './about-section';
import Testimonials from './testimonials-section';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { NetworkIcon } from './network-icons';
import { TvProviderIcon } from './tv-provider-icons';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';

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


export function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user is authenticated, redirect them to the account page.
    if (!isUserLoading && user) {
      router.replace('/account');
    }
  }, [user, isUserLoading, router]);

  // While loading, if the user is already determined to be logged in,
  // show a loading screen to prevent a flicker of the landing page.
  if (isUserLoading || user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting to your dashboard...</p>
        </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Fast, Reliable, and Affordable Digital Services
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Your one-stop shop for cheap data, airtime top-ups, TV
                    subscriptions, and more.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video mx-auto overflow-hidden rounded-xl sm:w-full lg:order-last">
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
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700 delay-200">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                        How It Works
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                        Get Started in 3 Simple Steps
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                        Our platform is designed for speed and convenience.
                    </p>
                </div>
                <div className="mx-auto grid gap-8 md:grid-cols-3 md:gap-12">
                     <HowItWorksCard
                        icon={<UserPlus className="w-10 h-10 text-primary" />}
                        step="Step 1"
                        title="Create an Account"
                        description="Sign up for free in less than a minute. All you need is your name, email, and phone number."
                    />
                    <HowItWorksCard
                        icon={<Wallet className="w-10 h-10 text-primary" />}
                        step="Step 2"
                        title="Fund Your Wallet"
                        description="Easily add money to your secure wallet via automated bank transfer. It's fast and reliable."
                    />
                    <HowItWorksCard
                        icon={<Smile className="w-10 h-10 text-primary" />}
                        step="Step 3"
                        title="Enjoy Services"
                        description="Start buying cheap data, airtime, and paying for TV subscriptions instantly from your dashboard."
                    />
                </div>
            </div>
        </section>

        <section id="services" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700 delay-300">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                Our Services
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Everything You Need, All in One Place
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                We provide a seamless experience for all your mobile
                transactions, ensuring you get the best value for your money.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <ServiceCard
                icon={<Smartphone className="w-8 h-8 text-primary" />}
                title="Cheap Data Bundles"
                description="Enjoy the most affordable data plans for all major networks. Stay connected for less."
                href="/buy-data"
              />
              <ServiceCard
                icon={<Zap className="w-8 h-8 text-primary" />}
                title="Instant Airtime"
                description="Top up your phone or any other number with airtime instantly. Quick and hassle-free."
                href="/buy-airtime"
              />
              <ServiceCard
                icon={<Tv className="w-8 h-8 text-primary" />}
                title="TV Subscription"
                description="Renew your DSTV, GOtv, and StarTimes subscriptions from the comfort of your home."
                href="/tv-subscription"
              />
              <ServiceCard
                icon={<Repeat className="w-8 h-8 text-primary" />}
                title="Airtime to Cash"
                description="Convert your unused airtime back to cash at the best rates. Fast and secure."
                href="/airtime-to-cash"
              />
            </div>
          </div>
        </section>

         <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700 delay-400">
            <h2 className="text-2xl font-semibold text-center text-muted-foreground tracking-wider mb-8">
              SUPPORTING ALL MAJOR PROVIDERS
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16 grayscale opacity-75">
                <NetworkIcon network="mtn" className="h-10 w-auto" />
                <NetworkIcon network="airtel" className="h-12 w-auto" />
                <NetworkIcon network="glo" className="h-12 w-auto" />
                <div className="h-8 w-auto flex items-center">
                    <NineMobileIcon className="h-8 w-auto" />
                </div>
                <TvProviderIcon provider="dstv" className="h-10 w-auto text-foreground" />
                <TvProviderIcon provider="gotv" className="h-12 w-auto text-foreground" />
                <TvProviderIcon provider="startimes" className="h-12 w-auto text-foreground" />
            </div>
          </div>
        </section>
        
        <section id="why-us" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700 delay-500">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                        Why Choose Us?
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                        The DataConnect Advantage
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                        We are committed to providing you with the best possible service and value.
                    </p>
                </div>
                <div className="mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <FeatureCard
                        icon={<Clock className="w-8 h-8 text-primary" />}
                        title="Automated & Instant"
                        description="Our services are fully automated, ensuring your data, airtime, and subscriptions are delivered instantly, any time of day."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                        title="Secure Wallet System"
                        description="Your funds are safe with us. Our secure wallet system uses top-notch encryption to protect your money and transactions."
                    />
                     <FeatureCard
                        icon={<ThumbsUp className="w-8 h-8 text-primary" />}
                        title="Unbeatable Prices"
                        description="We work hard to offer the most competitive prices on data and airtime in Nigeria, giving you more value for your money."
                    />
                    <FeatureCard
                        icon={<Heart className="w-8 h-8 text-primary" />}
                        title="Customer Focused"
                        description="Your satisfaction is our priority. Our dedicated support team is always ready to assist you with any questions or issues."
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

        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
           <div className="container px-4 md:px-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700 delay-600">
               <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                        FAQ
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                        Frequently Asked Questions
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                        Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
                    </p>
                </div>
                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-lg font-semibold">How fast are transactions?</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                            Most transactions on DataConnect are instant. Data and airtime purchases are delivered within seconds, and TV subscriptions are activated immediately. Wallet funding is also automated and reflects within minutes.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-lg font-semibold">Is my money safe in the wallet?</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                            Absolutely. Your wallet is secure and protected. We use industry-standard security measures to ensure that your funds and personal information are always safe.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger className="text-lg font-semibold">Are there any hidden fees?</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                            We believe in transparency. For wallet funding, there is a small 1% processing fee. The prices for data, airtime, and TV subscriptions are exactly as stated on the platform. No hidden charges.
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-4">
                            <AccordionTrigger className="text-lg font-semibold">What if I have a problem with a transaction?</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                            Our customer support is here to help! You can reach us via WhatsApp or email through our Contact Us page. We are committed to resolving any issues you may encounter promptly.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
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
              Your one-stop shop for cheap data, airtime, and bill payments in Nigeria.
            </p>
            <div className="flex items-center space-x-2">
                <Input type="email" placeholder="Enter your email" className="max-w-xs flex-1" />
                <Button type="submit">Subscribe</Button>
            </div>
            <p className="text-xs text-muted-foreground">Stay updated with our latest deals and offers.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-3">
            <div className="space-y-3">
              <h4 className="font-semibold tracking-wide">Services</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="/buy-data" className="text-sm text-muted-foreground hover:text-primary">Buy Data</Link>
                <Link href="/buy-airtime" className="text-sm text-muted-foreground hover:text-primary">Buy Airtime</Link>
                <Link href="/tv-subscription" className="text-sm text-muted-foreground hover:text-primary">TV Subscription</Link>
                <Link href="/airtime-to-cash" className="text-sm text-muted-foreground hover:text-primary">Airtime to Cash</Link>
              </nav>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold tracking-wide">Company</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="/#about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link>
                <Link href="/#faq" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link>
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
                <div className="flex items-center space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5"/></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5"/></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5"/></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5"/></Link>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="group">
        <div className="grid gap-4 p-6 rounded-xl bg-background hover:bg-background/90 h-full border hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
           <div className="flex items-center text-sm font-semibold text-primary group-hover:underline">
                <span>Learn More</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
        </div>
    </Link>
  );
}

function HowItWorksCard({
  icon,
  step,
  title,
  description,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-4 p-6 rounded-lg text-center items-center justify-items-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
       <p className="text-sm font-semibold text-primary">{step}</p>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="text-center p-6 border-0 shadow-lg bg-card/50 hover:bg-card/100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
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

// 9mobile Icon needs to be included here as it's not in the main icons file
const NineMobileIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.64 18.23C13.88 18.23 16.03 17.65 17.93 16.59C17.16 14.61 15.7 12.98 13.79 11.93C15.7 10.88 17.16 9.25 17.93 7.27C16.03 6.21 13.88 5.63 11.64 5.63C9.4 5.63 7.25 6.21 5.35 7.27C6.12 9.25 7.58 10.88 9.49 11.93C7.58 12.98 6.12 14.61 5.35 16.59C7.25 17.65 9.4 18.23 11.64 18.23ZM11.64 21.84C5.21 21.84 0 16.63 0 10.2C0 3.77 5.21 -1.44 11.64 -1.44C18.07 -1.44 23.28 3.77 23.28 10.2C23.28 16.63 18.07 21.84 11.64 21.84Z" transform="translate(0 2.6)" fill="currentColor"/>
    </svg>
);
