
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function HeroSection() {
    const heroImage = PlaceHolderImages.find(img => img.id === 'hero-connect');

    return (
        <section className="w-full py-20 md:py-32 lg:py-40">
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
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/signup">
                      Get Started
                    </Link>
                  </Button>
                   <Button asChild size="lg" variant="outline">
                        <Link href="/contact">
                            Contact Sales
                        </Link>
                    </Button>
                </div>
              </div>
              <div className="relative aspect-video mx-auto overflow-hidden rounded-xl w-full shadow-2xl">
                 {heroImage && <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                />}
              </div>
            </div>
          </div>
        </section>
    );
}