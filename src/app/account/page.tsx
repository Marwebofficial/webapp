
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { User as UserIcon, Hash, Sigma, Smartphone, Phone, Tv, Repeat, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FundWalletDialog } from '@/components/fund-wallet-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  network: string;
  amount: number;
  details: string;
  recipientPhone: string;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
}

interface UserProfile {
    walletBalance?: number;
    pendingFundingRequest?: {
        amount: number;
        createdAt: any;
    };
}


function AccountInfoSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-52" />
                </div>
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
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-28" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <Sigma className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-24" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    <Hash className="h-4 w-4 text-muted-foreground" />
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-6 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-6 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-6 w-20" /></TableHead>
                            <TableHead><Skeleton className="h-6 w-24" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
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
  
  const userDocRef = useMemoFirebase(
    () => user ? doc(firestore, 'users', user.uid) : null,
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const allTransactionsQuery = useMemoFirebase(
    () => {
        if (!firestore || !user) return null;
        return query(
          collection(firestore, 'users', user.uid, 'transactions'),
          orderBy('createdAt', 'desc')
        );
    },
    [firestore, user]
  );
  
  const { data: allTransactions, isLoading: isLoadingAll } = useCollection<Transaction>(allTransactionsQuery);
  
  const recentTransactions = useMemo(() => allTransactions?.slice(0, 5) || [], [allTransactions]);

  const transactionStats = useMemo(() => {
    if (!allTransactions) return { totalSpent: 0, totalCount: 0 };
    return allTransactions.reduce((acc, tx) => {
        if (tx.status === 'Completed') {
            acc.totalSpent += tx.amount;
        }
        acc.totalCount += 1;
        return acc;
    }, { totalSpent: 0, totalCount: 0 });
  }, [allTransactions]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (timestamp: { seconds: number; nanoseconds: number } | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return format(date, "MMM d, yyyy");
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="container mx-auto p-4 py-8 md:p-12 space-y-8">
        <AccountInfoSkeleton />
        <StatsSkeleton />
        <RecentTransactionsSkeleton />
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting
  }

  return (
    <div className="container mx-auto p-4 py-8 md:p-12 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-2xl">
              <UserIcon />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.displayName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
      </Card>
      
       {userProfile?.pendingFundingRequest && (
        <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
          <Info className="h-4 w-4 !text-blue-800 dark:!text-blue-200" />
          <AlertTitle>Pending Funding Request</AlertTitle>
          <AlertDescription>
            We are processing your request to fund ₦{userProfile.pendingFundingRequest.amount.toLocaleString()}. Your wallet will be credited shortly after confirmation.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₦{(userProfile?.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">Available for purchases</p>
            </CardContent>
            <CardFooter>
               <FundWalletDialog>
                  <Button className="w-full">
                    <Wallet className="mr-2 h-4 w-4" /> Fund Wallet
                  </Button>
               </FundWalletDialog>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <Sigma className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoadingAll ? <Skeleton className="h-8 w-24" /> : (
                    <div className="text-2xl font-bold">₦{transactionStats.totalSpent.toLocaleString()}</div>
                )}
                <p className="text-xs text-muted-foreground">on successful transactions</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 {isLoadingAll ? <Skeleton className="h-8 w-12" /> : (
                    <div className="text-2xl font-bold">{transactionStats.totalCount}</div>
                )}
                <p className="text-xs text-muted-foreground">across all services</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access our services quickly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionCard href="/buy-data" title="Buy Data" icon={<Smartphone className="w-8 h-8 text-primary" />} />
            <ActionCard href="/buy-airtime" title="Buy Airtime" icon={<Phone className="w-8 h-8 text-primary" />} />
            <ActionCard href="/tv-subscription" title="TV Subscription" icon={<Tv className="w-8 h-8 text-primary" />} />
            <ActionCard href="/airtime-to-cash" title="Airtime to Cash" icon={<Repeat className="w-8 h-8 text-primary" />} />
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your last 5 transactions.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
                <Link href="/history">View All</Link>
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingAll ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    </TableRow>
                ))
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{formatDate(tx.createdAt)}</TableCell>
                    <TableCell>
                        <div className="font-medium">{tx.type}</div>
                        <div className="text-sm text-muted-foreground">{tx.details}</div>
                    </TableCell>
                    <TableCell>₦{tx.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    You have no transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
