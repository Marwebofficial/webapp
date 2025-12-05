
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutSection() {
    const aboutImage = PlaceHolderImages.find(img => img.id === 'about');
    return (
         <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm mb-2">
                  About DataConnect
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Connecting and Educating Nigeria
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  DataConnect was founded on a dual mission: to make digital services accessible and affordable, and to empower Nigerians through innovative educational tools. We believe in leveraging technology to bridge gaps in connectivity and learning.
                </p>
                <div className="space-y-4 text-muted-foreground md:text-lg/relaxed">
                    <div>
                        <h3 className="font-semibold text-foreground mb-1">Our Vision</h3>
                        <p>To be Nigeria's most trusted platform for both digital transactions and AI-driven education, empowering millions to thrive in a connected world.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-foreground mb-1">Our Commitment</h3>
                        <p>We are dedicated to reliability, security, and exceptional value. Whether you're buying data or preparing for an exam, we ensure a seamless and supportive experience.</p>
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

    