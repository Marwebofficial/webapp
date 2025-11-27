
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Wifi } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

export function Nav() {
  const isMobile = useIsMobile();
  const [isSheetOpen, setSheetOpen] = useState(false);

  const closeSheet = () => setSheetOpen(false);

  const navLinks = (
    <>
      <Link
        href="/buy-data"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
        onClick={closeSheet}
      >
        Buy Data
      </Link>
      <Link
        href="/buy-airtime"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
        onClick={closeSheet}
      >
        Buy Airtime
      </Link>
      <Link
        href="/airtime-to-cash"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
        onClick={closeSheet}
      >
        Airtime to Cash
      </Link>
    </>
  );

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <Link href="/" className="flex items-center justify-center" onClick={closeSheet}>
        <Wifi className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">DataConnect</span>
      </Link>
      {isMobile ? (
        <nav className="ml-auto">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 p-4">
                <Link href="/" className="flex items-center" onClick={closeSheet}>
                  <Wifi className="h-6 w-6 text-primary" />
                  <span className="ml-2 text-lg font-semibold">DataConnect</span>
                </Link>
                <div className="flex flex-col gap-4 mt-4">
                  {navLinks}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      ) : (
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          {navLinks}
        </nav>
      )}
    </header>
  );
}
