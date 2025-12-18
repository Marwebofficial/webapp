
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { doc, collection, serverTimestamp, getDocs, writeBatch, increment, query, where } from 'firebase/firestore';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  networkProviders,
  type DataPlan,
  type Network,
} from '@/lib/data-plans';
import { NetworkIcon } from './network-icons';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';

export type { DataPlan };

const FormSchema = z.object({
  network: z.custom<Network>(
    (val) => networkProviders.some((p) => p.id === val),
    {
      message: 'Please select a network provider.',
    }
  ),
  data_id: z.string().min(1, 'Please select a data plan.'),
  phone: z
    .string()
    .regex(
      /^(\+234|0)?[7-9][01]\d{8}$/,
      'Please enter a valid Nigerian phone number.'
    ),
  name: z.string().optional(),
  email: z
    .string()
    .email('Please enter a valid email.')
    .optional()
    .or(z.literal('')),
  referral: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  walletBalance?: number;
}

interface NetworkStatus {
  id: string;
  name: string;
  status: 'Online' | 'Degraded' | 'Offline';
}

function PurchaseFormSkeleton() {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl">
            <CardHeader className="items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                </div>
                 <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-12 w-full rounded-full" />
            </CardFooter>
        </Card>
    )
}

export function DataPurchaseForm() {
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [networkStatuses, setNetworkStatuses] = useState<NetworkStatus[]>([]);

  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const currentNetworkStatus = useMemo(
    () => networkStatuses?.find(s => s.id === selectedNetwork),
    [networkStatuses, selectedNetwork]
  );
  
  useEffect(() => {
    async function fetchNetworkStatuses() {
      if (firestore) {
        const statusCol = collection(firestore, 'networkStatus');
        const statusSnapshot = await getDocs(statusCol);
        if (statusSnapshot.empty) {
            const localStatuses = networkProviders.map(p => ({
                id: p.id,
                name: p.name,
                status: 'Online' as const
            }));
            setNetworkStatuses(localStatuses);
        } else {
            const statuses = statusSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NetworkStatus));
            setNetworkStatuses(statuses);
        }
      }
    }
    fetchNetworkStatuses();
  }, [firestore]);


  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      referral: '',
    },
  });
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userProfile) {
      form.setValue('name', userProfile.name || '');
      form.setValue('email', userProfile.email || '');
      form.setValue('phone', userProfile.phoneNumber || '');
    } else if (user) {
      form.setValue('name', user.displayName || '');
      form.setValue('email', user.email || '');
    }
  }, [user, userProfile, form]);

  const fetchPlans = useCallback(async (networkId: Network) => {
    if (!firestore) return;
    setIsLoadingPlans(true);
    setDataPlans([]);
    try {
      const plansCollection = collection(firestore, 'dataPlans');
      const plansQuery = query(plansCollection, where('provider', '==', networkId));
      const querySnapshot = await getDocs(plansQuery);
      const plans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DataPlan));
      setDataPlans(plans);
    } catch (error) {
      console.error("Error fetching data plans:", error);
      toast({
        title: 'Error',
        description: 'Could not fetch data plans. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPlans(false);
    }
  }, [firestore, toast]);

  const handleNetworkChange = (networkId: Network) => {
    setSelectedNetwork(networkId);
    form.setValue('network', networkId);
    setSelectedPlan(null);
    form.resetField('data_id');
    fetchPlans(networkId);
  };

  const handlePlanSelect = (plan: DataPlan) => {
    setSelectedPlan(plan);
    form.setValue('data_id', plan.id, { shouldValidate: true });
  };

  async function onSubmit(data: FormData) {
    if (!dataPlans || !user || !firestore) return;

    const planDetails = dataPlans.find(p => p.id === data.data_id);
    if (!planDetails) {
      toast({ title: 'Error', description: 'Selected plan not found. Please try again.', variant: 'destructive' });
      return;
    }

    if (!userProfile || (userProfile.walletBalance || 0) < planDetails.price) {
        toast({
            title: 'Insufficient Funds',
            description: `Your wallet balance is too low for this transaction. Please fund your wallet and try again.`,
            variant: 'destructive',
        });
        return;
    }

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network_id: data.network,
          mobile_number: data.phone,
          plan_id: planDetails.data_id, // Use the correct numeric data_id
        }),
      });

      const result = await response.json();
      const batch = writeBatch(firestore);
      const userRef = doc(firestore, 'users', user.uid);
      const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));

      if (response.ok && result.status === 'success') {
        batch.update(userRef, { walletBalance: increment(-planDetails.price) });
        
        batch.set(transactionRef, {
            type: 'Data Purchase',
            network: data.network,
            amount: planDetails.price,
            details: planDetails.label,
            recipientPhone: data.phone,
            status: 'Completed',
            createdAt: serverTimestamp(),
            transactionId: result.transaction_id || null
        });

        await batch.commit();

        toast({
          title: 'Success',
          description: result.message || 'Data purchase successful!',
        });

      } else {
        batch.set(transactionRef, {
            type: 'Data Purchase',
            network: data.network,
            amount: planDetails.price,
            details: planDetails.label,
            recipientPhone: data.phone,
            status: 'Failed',
            createdAt: serverTimestamp(),
            transactionId: result.transaction_id || null
        });
        
        await batch.commit();

        toast({
          title: 'Purchase Failed',
          description: result.error || 'Data purchase failed. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Error purchasing data:", error);
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      if (error instanceof Error) {
          errorMessage = error.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }
  
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'Online':
        return 'default';
      case 'Degraded':
        return 'secondary';
      case 'Offline':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isUserLoading || !user) {
    return <PurchaseFormSkeleton />;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center">
          DataConnect Nigeria
        </CardTitle>
        <CardDescription className="text-center">
          Buy mobile data instantly. Delivered in minutes.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="network"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold font-headline flex justify-between items-center">
                    <span>1. Select Network</span>
                    {currentNetworkStatus && (
                      <Badge variant={getStatusVariant(currentNetworkStatus.status)}>
                        {currentNetworkStatus.status}
                      </Badge>
                    )}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value: string) =>
                        handleNetworkChange(value as Network)
                      }
                      defaultValue={field.value}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {networkProviders.map((provider) => (
                        <FormItem key={provider.id}>
                          <FormControl>
                            <RadioGroupItem
                              value={provider.id}
                              className="sr-only"
                            />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              'flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/10 hover:border-primary cursor-pointer transition-all',
                              field.value === provider.id &&
                                'border-primary ring-2 ring-primary bg-accent/10'
                            )}
                          >
                            <NetworkIcon
                              network={provider.id}
                              className="w-12 h-12 mb-2"
                            />
                            <span className="font-bold">{provider.name}</span>
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedNetwork && (
              <div className="animate-in fade-in-20 duration-300">
                <FormField
                  control={form.control}
                  name="data_id"
                  render={() => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg font-semibold font-headline">
                        2. Choose Data Plan
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
                          {isLoadingPlans && (
                            <>
                              <Skeleton className="h-24 w-full" />
                              <Skeleton className="h-24 w-full" />
                              <Skeleton className="h-24 w-full" />
                            </>
                          )}
                          {dataPlans && dataPlans.map((plan) => (
                            <Card
                              key={plan.id}
                              onClick={() => handlePlanSelect(plan)}
                              className={cn(
                                'cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1',
                                selectedPlan?.id === plan.id
                                  ? 'border-primary ring-2 ring-primary'
                                  : 'border-border'
                              )}
                            >
                              <CardContent className="p-3 md:p-4 text-center flex flex-col items-center justify-center h-full">
                                <p className="font-bold text-base md:text-lg text-primary">
                                  {plan.label}
                                </p>
                                <p className="text-muted-foreground font-semibold">
                                  ₦{plan.price.toLocaleString()}
                                </p>
                                {plan.validity && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {plan.validity}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="space-y-4">
              <p className="text-lg font-semibold font-headline">
                3. Recipient Phone Number
              </p>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 08012345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch space-y-4">
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 font-bold rounded-full shadow-lg transition-transform hover:scale-105"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
               {form.formState.isSubmitting ? 'Processing...' : 'Buy Now'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
