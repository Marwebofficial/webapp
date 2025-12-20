'use client';

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Wallet, Sigma, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FundWalletDialog } from '@/components/fund-wallet-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
    walletBalance?: number;
}

interface Transaction {
    id: string;
    status: 'Pending' | 'Completed' | 'Failed';
    amount?: number;
}

export function Stats() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(
        () => (user ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

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

    const transactionStats = useMemo(() => {
        if (!allTransactions) return { totalSpent: 0, totalCount: 0 };
        return allTransactions.reduce((acc, tx) => {
            if (tx.status === 'Completed' && tx.amount) {
                acc.totalSpent += tx.amount;
            }
            acc.totalCount += 1;
            return acc;
        }, { totalSpent: 0, totalCount: 0 });
    }, [allTransactions]);

    return (
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
                <CardFooter className="flex-col items-start">
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
    );
}
