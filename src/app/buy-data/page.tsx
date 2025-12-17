'use client';

import { type DataPlan } from '@/components/data-purchase-form';
import { collection, getDocs, Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { networkProviders } from '@/lib/data-plans';
import dynamic from 'next/dynamic';
import { DataPurchaseFormSkeleton } from '@/components/data-purchase-form-skeleton';
import { useEffect, useState } from 'react';

const DataPurchaseForm = dynamic(() => import('@/components/data-purchase-form').then(mod => mod.DataPurchaseForm), {
  ssr: false,
  loading: () => <DataPurchaseFormSkeleton />,
});

async function getInitialDataPlans(firestore: Firestore, networkId: string) {
  try {
    const plansQuery = collection(firestore, 'dataPlans', networkId, 'plans');
    const querySnapshot = await getDocs(plansQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DataPlan));
  } catch (error) {
    console.error("Error fetching initial data plans:", error);
    return [];
  }
}

export default function BuyDataPage() {
  const firestore = useFirestore();
  const [initialDataPlans, setInitialDataPlans] = useState<DataPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const initialNetwork = networkProviders[0].id;

  useEffect(() => {
    if (firestore) {
      getInitialDataPlans(firestore, initialNetwork).then(plans => {
        setInitialDataPlans(plans);
        setIsLoading(false);
      });
    }
  }, [firestore, initialNetwork]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center p-4 py-8 md:p-12 bg-background">
        <DataPurchaseFormSkeleton />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 py-8 md:p-12 bg-background">
      <DataPurchaseForm initialDataPlans={initialDataPlans} initialNetwork={initialNetwork} />
    </main>
  );
}
