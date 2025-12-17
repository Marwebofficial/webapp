
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowRight } from 'lucide-react';

export function EngagementSection() {
    return (
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
    );
}