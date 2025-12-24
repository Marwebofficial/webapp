
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, lazy } from 'react';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Smartphone, Phone, Repeat, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AccountInfo } from '@/components/account/AccountInfo';
import { Stats } from '@/components/account/Stats';
import { RecentTransactions } from '@/components/account/RecentTransactions';

const Testimonials = lazy(() => import('@/components/testimonials-section'));

interface UserProfile {
    pendingFundingRequest?: {
        amount: number;
        createdAt: any;
    };
}

interface Announcement {
    text: string;
    enabled: boolean;
}

function AccountInfoSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-52" />
                    </div>
                </div>
                <Skeleton className="h-10 w-32" />
            </CardHeader>
        </Card>
    );
}

function StatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-28" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-24" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-12" />
                </CardContent>
            </Card>
        </div>
    );
}

function RecentTransactionsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your last 5 transactions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
    )
}

function TestimonialsSkeleton() {
    return (
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-96" />
                <Skeleton className="h-6 w-full max-w-2xl" />
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-60 w-full" />
                <Skeleton className="h-60 w-full" />
                <Skeleton className="h-60 w-full" />
              </div>
          </div>
        </section>
    )
}


function ActionCard({ icon, title, href }: { icon: React.ReactNode, title: string, href: string }) {
    return (
        <Link href={href} passHref>
            <Card className="hover:bg-accent/50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-full">
                    {icon}
                    <p className="font-semibold text-sm">{title}</p>
                </CardContent>
            </Card>
        </Link>
    )
}

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [announcementDialog, setAnnouncementDialog] = useState({ open: false, text: '' });
  
  const userDocRef = useMemoFirebase(
    () => user ? doc(firestore, 'users', user.uid) : null,
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const announcementRef = useMemoFirebase(
    () => firestore ? doc(firestore, 'announcement', 'current') : null,
    [firestore]
  );
  const { data: announcement, isLoading: isAnnouncementLoading } = useDoc<Announcement>(announcementRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!isAnnouncementLoading && announcement?.enabled && announcement.text) {
        setAnnouncementDialog({ open: true, text: announcement.text });
    }
  }, [announcement, isAnnouncementLoading]);

  if (isUserLoading || isProfileLoading || isAnnouncementLoading) {
    return (
      <div className="container mx-auto p-4 py-8 md:p-12 space-y-8">
        <AccountInfoSkeleton />
        <StatsSkeleton />
        <RecentTransactionsSkeleton />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
       <div className="container mx-auto p-4 py-8 md:p-12 space-y-8">
            <AlertDialog open={announcementDialog.open} onOpenChange={(open) => setAnnouncementDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Megaphone className="h-6 w-6 text-primary" />
                    </div>
                    <AlertDialogTitle className="text-2xl">Announcement</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base text-foreground">
                    {announcementDialog.text}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction>Got it!</AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>

            <AccountInfo />
            
            {userProfile?.pendingFundingRequest && (
                <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
                <Info className="h-4 w-4 !text-blue-800 dark:!text-blue-200" />
                <AlertTitle>Pending Funding Request</AlertTitle>
                <AlertDescription>
                    We are processing your request to fund ₦{userProfile.pendingFundingRequest.amount.toLocaleString()}. Your wallet will be credited shortly after confirmation.
                </AlertDescription>
                </Alert>
            )}

            <Stats />

            <Card>
                <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access our services quickly.</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ActionCard href="/buy-data" title="Buy Data" icon={<Smartphone className="w-8 h-8 text-primary" />} />
                    <ActionCard href="/buy-airtime" title="Buy Airtime" icon={<Phone className="w-8 h-8 text-primary" />} />
                </div>
                </CardContent>
            </Card>

            <RecentTransactions />
        </div>
        <Suspense fallback={<TestimonialsSkeleton />}>
            <Testimonials />
        </Suspense>
    </div>
  );
}
