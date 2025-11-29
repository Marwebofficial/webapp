
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
  MessageSquare,
  Heart,
} from 'lucide-react';
import Image from 'next/image';
import { ReviewFormDialog } from './review-form-dialog';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
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

interface Review {
  id: string;
  name: string;
  reviewText: string;
  rating: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
}

function Testimonials() {
  const firestore = useFirestore();
  const reviewsQuery = useMemoFirebase(
    () => {
        if (!firestore) return null;
        return query(
          collection(firestore, 'reviews'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
    },
    [firestore]
  );
  
  const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);
  
  const formatDate = (timestamp: { seconds: number; nanoseconds: number } | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };


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
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto"
          >
            <CarouselContent>
              {reviews.map((review) => (
                <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="h-full flex flex-col">
                      <CardHeader className="flex-row items-center gap-4 pb-4">
                         <Avatar className="w-12 h-12">
                            <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{review.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between pt-0">
                         <p className="text-muted-foreground mb-4">"{review.reviewText}"</p>
                         <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        ) : (
          <p className="text-center text-muted-foreground">No reviews yet. Be the first to write one!</p>
        )}

        <div className="mt-12 text-center">
            <ReviewFormDialog />
        </div>
      </div>
    </section>
  )
}

export function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  const aboutImage = PlaceHolderImages.find(img => img.id === 'about');

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
                Instant Data, Airtime, TV & More
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Stay connected with the cheapest mobile data, airtime, TV
                subscriptions, and easily convert airtime to cash. Delivered in
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

        <Testimonials />

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
                <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                  DataConnect Nigeria was born from a simple idea: to make digital services accessible and affordable for everyone. We believe that staying connected shouldn't be complicated or expensive.
                </p>
                <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                  Our mission is to provide a fast, reliable, and secure platform for all your mobile needs. We are a team of passionate individuals dedicated to customer satisfaction, constantly innovating to bring you the best deals and the most convenient experience.
                </p>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden">
                {aboutImage && <Image
                    src={aboutImage.imageUrl}
                    alt={aboutImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={aboutImage.imageHint}
                />}
              </div>
            </div>
          </div>
        </section>
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
