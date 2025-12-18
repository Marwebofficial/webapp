
"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  details: string;
  status: 'Completed' | 'Failed' | 'Pending';
  createdAt: Timestamp;
  recipientPhone?: string;
}

export function TransactionsTable() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && firestore) {
      const transQuery = query(
        collection(firestore, 'users', user.uid, 'transactions'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(transQuery, (snapshot) => {
        const trans = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Transaction, 'id'>),
        }));
        setTransactions(trans);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [user, firestore]);

  const columns: ColumnDef<Transaction>[] = useMemo(() => [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Timestamp | null;
        return date ? new Date(date.seconds * 1000).toLocaleString() : 'N/A';
      },
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
        accessorKey: "details",
        header: "Details",
        cell: ({ row }) => {
            const details = row.original.details;
            const recipient = row.original.recipientPhone;
            return (
                <div>
                    <div>{details}</div>
                    {recipient && <div className="text-xs text-muted-foreground">To: {recipient}</div>}
                </div>
            )
        }
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
    
            const getStatusVariant = (status: string) => {
                switch (status.toLowerCase()) {
                    case 'completed':
                        return 'default';
                    case 'failed':
                        return 'destructive';
                    default:
                        return 'secondary';
                }
            };
    
            return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
        },
    },
  ], []);

  return <DataTable columns={columns} data={transactions} isLoading={isLoading} />;
}
