'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Transaction {
    id: string;
    type: string;
    network: string;
    amount?: number;
    details: string;
    recipientPhone: string;
    status: 'Pending' | 'Completed' | 'Failed';
    createdAt: {
        seconds: number;
        nanoseconds: number;
    } | null;
}

export function RecentTransactions() {
    const { user } = useUser();
    const firestore = useFirestore();

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

    return (
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
                                    <TableCell>{tx.amount ? `₦${tx.amount.toLocaleString()}` : 'N/A'}</TableCell>
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
    );
}
