
import Link from 'next/link';
import { Button } from './ui/button';
import { ShieldCheck } from 'lucide-react';

export function SecuritySection() {
    return (
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
    );
}