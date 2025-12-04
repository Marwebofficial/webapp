
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutSection() {
    const aboutImage = PlaceHolderImages.find(img => img.id === 'about');
    return (
         <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-secondary animate-in fade-in-50 slide-in-from-bottom-10 duration-700 delay-500">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm mb-2">
                  About DataConnect
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Connecting Nigeria, One Transaction at a Time
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  DataConnect Nigeria was founded on a simple yet powerful mission: to make digital services like data, airtime, and subscriptions accessible and affordable for every Nigerian. We saw the daily frustrations of complex processes and high costs, and we knew there had to be a better way.
                </p>
                <div className="space-y-4 text-muted-foreground md:text-lg/relaxed">
                    <div>
                        <h3 className="font-semibold text-foreground mb-1">Our Vision</h3>
                        <p>To be Nigeria's most trusted and user-friendly platform for digital transactions, empowering millions to stay connected effortlessly.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-foreground mb-1">Our Commitment</h3>
                        <p>We are a team of passionate innovators dedicated to your satisfaction. We promise reliability, security, and unbeatable value, ensuring a seamless experience every time you use our service.</p>
                    </div>
                </div>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
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
    );
}

    