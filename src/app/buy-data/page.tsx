
import { DataPurchaseForm, type DataPlan } from '@/components/data-purchase-form';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { networkProviders } from '@/lib/data-plans';

async function getInitialDataPlans(networkId: string) {
  if (!firestore) return [];
  try {
    const plansQuery = collection(firestore, 'dataPlans', networkId, 'plans');
    const querySnapshot = await getDocs(plansQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DataPlan));
  } catch (error) {
    console.error("Error fetching initial data plans:", error);
    return [];
  }
}

export default async function BuyDataPage() {
  const initialNetwork = networkProviders[0].id;
  const initialDataPlans = await getInitialDataPlans(initialNetwork);

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 py-8 md:p-12 bg-background">
      <DataPurchaseForm initialDataPlans={initialDataPlans} initialNetwork={initialNetwork} />
    </main>
  );
}
