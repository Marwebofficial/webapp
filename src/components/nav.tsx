import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wifi } from 'lucide-react';

export function Nav() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <Link href="/" className="flex items-center justify-center">
        <Wifi className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">DataConnect</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link
          href="/buy-data"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Buy Data
        </Link>
        <Link
          href="/buy-airtime"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Buy Airtime
        </Link>
        <Link
          href="/airtime-to-cash"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Airtime to Cash
        </Link>
      </nav>
    </header>
  );
}
