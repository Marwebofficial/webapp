
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutSection() {
    const aboutImage = PlaceHolderImages.find(img => img.id === 'about');
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
    );
}
