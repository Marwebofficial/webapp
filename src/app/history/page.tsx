
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Receipt } from "@/components/receipt";

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
  } | any;
}

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const transactionsQuery = useMemoFirebase(
    () => {
        if (!firestore || !user) return null;
        return query(
          collection(firestore, 'users', user.uid, 'transactions'),
          orderBy('createdAt', 'desc')
        );
    },
    [firestore, user]
  );
  
  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

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
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const renderSkeleton = () => (
    <TableRow>
      <TableCell colSpan={5} className="h-24 text-center">
        <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
      </TableCell>
    </TableRow>
  );

  if (selectedTransaction) {
    return (
      <div className="container mx-auto p-4 py-8 md:p-12">
        <Receipt transaction={selectedTransaction} onBack={() => setSelectedTransaction(null)} />
      </div>
    );
  }

  if (isUserLoading || !user) {
    return (
        <div className="container mx-auto p-4 py-8 md:p-12">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Skeleton className="h-6 w-24" /></TableHead>
                                    <TableHead><Skeleton className="h-6 w-32" /></TableHead>
                                    <TableHead><Skeleton className="h-6 w-20" /></TableHead>
                                    <TableHead><Skeleton className="h-6 w-24" /></TableHead>
                                    <TableHead><Skeleton className="h-6 w-24" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderSkeleton()}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8 md:p-12">
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>A record of your recent transactions. Click on a row to view receipt.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  renderSkeleton()
                ) : transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id} onClick={() => setSelectedTransaction(tx)} className="cursor-pointer">
                      <TableCell className="font-medium whitespace-nowrap">{formatDate(tx.createdAt)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                          <div className="font-medium">{tx.type}</div>
                          <div className="text-sm text-muted-foreground">{tx.details} on {tx.network.toUpperCase()}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{tx.amount ? `₦${tx.amount.toLocaleString()}` : 'N/A'}</TableCell>
                      <TableCell className="whitespace-nowrap">{tx.recipientPhone}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      You have no transactions yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
