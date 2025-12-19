
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, writeBatch, increment, collection, serverTimestamp } from 'firebase/firestore';
import { Wallet } from 'lucide-react';
import { Receipt } from '@/components/receipt'; // Import the Receipt component

const networkOptions = [
  { id: 1, name: 'mtn' },
  { id: 2, name: 'glo' },
  { id: 3, name: '9mobile' },
  { id: 4, name: 'airtel' },
];

interface Plan {
  id: string;
  name: string;
  data_id: string;
}

interface UserProfile {
  walletBalance?: number;
  pin?: string;
}

interface Transaction {
  type: string;
  network?: string;
  details: string;
  recipientPhone: string;
  status: string;
  createdAt: any;
  transactionId?: string;
}

export function SimpleDataPurchaseForm() {
  const [networkId, setNetworkId] = useState<number | ''>('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [pin, setPin] = useState('');
  const [selectedPlanDocId, setSelectedPlanDocId] = useState<string | ''>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [alertState, setAlertState] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: '', message: '' });
  const [receipt, setReceipt] = useState<Transaction | null>(null); // State for the receipt

  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!networkId) return;
      setIsFetchingPlans(true);
      try {
        const networkName = networkOptions.find(n => n.id === networkId)?.name;
        if (!networkName) return;
        const res = await fetch(`/api/plans?network=${networkName}`);
        const data = await res.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
        setPlans([]);
      } finally {
        setIsFetchingPlans(false);
      }
    };

    fetchPlans();
  }, [networkId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setReceipt(null); // Clear previous receipt

    if (!user || !firestore) {
      setAlertState({ open: true, title: 'Error', message: 'You must be logged in to make a purchase.' });
      setIsLoading(false);
      return;
    }

    if (userProfile?.pin !== pin) {
        setAlertState({ open: true, title: 'Invalid PIN', message: 'The PIN you entered is incorrect. Please try again.' });
        setIsLoading(false);
        return;
    }

    const selectedPlan = plans.find(p => p.id === selectedPlanDocId);
    if (!selectedPlan) {
      setAlertState({ open: true, title: 'Error', message: 'Please select a valid plan.' });
      setIsLoading(false);
      return;
    }

    let result: any;
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network_id: Number(networkId),
          mobile_number: mobileNumber,
          plan_id: Number(selectedPlan.data_id),
          Ported_number: true,
        }),
      });

      result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || `Request failed with status ${res.status}`);
      }

      const batch = writeBatch(firestore);
      const userRef = doc(firestore, 'users', user.uid);
      const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));
      
      const transactionData: Transaction = {
        type: 'Data Purchase',
        network: networkOptions.find(n => n.id === networkId)?.name,
        details: selectedPlan.name,
        recipientPhone: mobileNumber,
        status: result.status === 'success' ? 'Completed' : 'Failed',
        createdAt: serverTimestamp(),
        transactionId: result.transaction_id || null,
      };

      if (result.status === 'success') {
        batch.set(transactionRef, transactionData);
        setAlertState({ open: true, title: 'Purchase Successful', message: result.message || 'Your data purchase was successful!' });
        setReceipt(transactionData); // Set receipt data
      } else {
        batch.set(transactionRef, { ...transactionData, failureReason: result.error || 'Unknown failure reason' });
        setAlertState({ open: true, title: 'Purchase Failed', message: result.error || 'The transaction failed. Your wallet was not charged.' });
      }

      await batch.commit();

    } catch (error: any) {
        console.error("Data purchase failed:", error);
        const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));
        const batch = writeBatch(firestore);
        const transactionData: Transaction = {
            type: 'Data Purchase',
            network: networkOptions.find(n => n.id === networkId)?.name,
            details: selectedPlan.name,
            recipientPhone: mobileNumber,
            status: 'Failed',
            createdAt: serverTimestamp(),
            failureReason: error.message
        };
        batch.set(transactionRef, transactionData);
        await batch.commit().catch(console.error); 

        setAlertState({ open: true, title: 'Error', message: error.message || 'An unexpected error occurred. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanDocId);

  if (receipt) {
    return <Receipt transaction={receipt} />;
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 py-8 md:p-12 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Data Purchase</CardTitle>
          <CardDescription>A simple form to test data purchases.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Network</Label>
              <div className="grid grid-cols-2 gap-4">
                {networkOptions.map((network) => (
                  <Button
                    key={network.id}
                    variant={networkId === network.id ? 'default' : 'outline'}
                    onClick={() => {
                      setNetworkId(network.id);
                      setSelectedPlanDocId('');
                      setPlans([]);
                    }}
                    type="button"
                  >
                    {network.name.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            {isFetchingPlans && <p>Fetching plans...</p>}
            {plans.length > 0 && (
              <div className="space-y-2">
                <Label>Plan</Label>
                <div className="grid grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <Button
                      key={plan.id}
                      variant={selectedPlanDocId === plan.id ? 'default' : 'outline'}
                      onClick={() => setSelectedPlanDocId(plan.id)}
                      type="button"
                      className="h-auto whitespace-normal"
                    >
                      {plan.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedPlan && (
                <div className="mt-4 p-4 bg-muted rounded-md text-sm space-y-1">
                    <p className='font-medium'>Summary:</p>
                    <p>Network: <span className='font-bold'>{networkOptions.find(n => n.id === networkId)?.name.toUpperCase()}</span></p>
                    <p>Plan: <span className='font-bold'>{selectedPlan.name}</span></p>
                </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g., 08012345678"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">Transaction PIN</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                maxLength={4}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit" disabled={isLoading || isFetchingPlans || !selectedPlanDocId || !mobileNumber || pin.length !== 4}>
              {isLoading ? 'Processing...' : 'Purchase'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <AlertDialog open={alertState.open} onOpenChange={(open) => setAlertState({ ...alertState, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertState.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
