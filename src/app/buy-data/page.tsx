'use client';

import dynamic from 'next/dynamic';
import { DataPurchaseFormSkeleton } from '@/components/data-purchase-form-skeleton';

const DataPurchaseForm = dynamic(() => import('@/components/data-purchase-form').then(mod => mod.DataPurchaseForm), {
  ssr: false,
  loading: () => <DataPurchaseFormSkeleton />,
});

export default function BuyDataPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 py-8 md:p-12 bg-background">
      <DataPurchaseForm />
    </main>
  );
}
