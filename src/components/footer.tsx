
import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
    return (
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
    );
}