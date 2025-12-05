
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Wifi, UserCircle, History, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';

export function Nav() {
  const isMobile = useIsMobile();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const isAdmin = user?.email === 'samuelmarvel21@gmail.com';

  const handleSignOut = () => {
    auth.signOut();
  };

  const closeSheet = () => setSheetOpen(false);

  const navLinks = (
    <>
      <Link
        href="/#features"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
        onClick={closeSheet}
      >
        Features
      </Link>
      <Link
        href="/#about"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
        onClick={closeSheet}
      >
        About Us
      </Link>
      <Link
        href="/#ai-tools"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
        onClick={closeSheet}
      >
        AI Tools
      </Link>
      <Link
        href="/blog"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
        onClick={closeSheet}
      >
        Educational Resources
      </Link>
      <Link
        href="/contact"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
        onClick={closeSheet}
      >
        Contact
      </Link>
    </>
  );

  const authLinks = (
    <div className="flex items-center gap-2">
      {isUserLoading ? (
        <>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </>
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <UserCircle />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/account">My Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/history">
                <History className="mr-2 h-4 w-4" />
                <span>Purchase History</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button asChild variant="ghost" onClick={closeSheet}>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild onClick={closeSheet}>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      )}
    </div>
  );

  const mobileAuthLinks = (
    <div className="flex flex-col gap-2 mt-4">
      {isUserLoading ? (
        <>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </>
      ) : user ? (
        <>
          {isAdmin && (
            <Button asChild variant="outline" onClick={closeSheet}>
                <Link href="/admin">Admin Dashboard</Link>
            </Button>
          )}
          <Button asChild variant="outline" onClick={closeSheet}>
            <Link href="/account">My Account</Link>
          </Button>
          <Button asChild variant="outline" onClick={closeSheet}>
            <Link href="/history">Purchase History</Link>
          </Button>
          <Button
            onClick={() => {
              handleSignOut();
              closeSheet();
            }}
          >
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant="ghost" onClick={closeSheet}>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild onClick={closeSheet}>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <Link
        href="/"
        className="flex items-center justify-center"
        onClick={closeSheet}
      >
        <Wifi className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">DataConnect</span>
      </Link>
      {isMobile ? (
        <div className="ml-auto flex items-center gap-4">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>
                  <Link
                    href="/"
                    className="flex items-center"
                    onClick={closeSheet}
                  >
                    <Wifi className="h-6 w-6 text-primary" />
                    <span className="ml-2 text-lg font-semibold">
                      DataConnect
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-4 mt-4">{navLinks}</div>
                <div className="mt-auto">{mobileAuthLinks}</div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          {navLinks}
          {authLinks}
        </nav>
      )}
    </header>
  );
}
