
"use client";

import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { doc, collection, serverTimestamp, updateDoc, getDocs } from 'firebase/firestore';

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
import { networkProviders, type Network } from '@/lib/data-plans';
import { NetworkIcon } from './network-icons';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

const WHATSAPP_NUMBER = '2349040367103';

const FormSchema = z.object({
  network: z.custom<Network>(
    (val) => networkProviders.some((p) => p.id === val),
    {
      message: 'Please select a network provider.',
    }
  ),
  amount: z.coerce
    .number()
    .min(50, 'Amount must be at least ₦50.')
    .max(10000, 'Amount must not exceed ₦10,000.'),
  phone: z
    .string()
    .regex(
      /^(\+234|0)?[7-9][01]\d{8}$/,
      'Please enter a valid Nigerian phone number.'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50),
  email: z
    .string()
    .email('Please enter a valid email.')
    .optional()
    .or(z.literal('')),
});

type FormData = z.infer<typeof FormSchema>;

interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
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

export function AirtimePurchaseForm() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [networkStatuses, setNetworkStatuses] = useState<NetworkStatus[]>([]);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  
  useEffect(() => {
    async function fetchNetworkStatuses() {
      if (firestore) {
        const statusCol = collection(firestore, 'networkStatus');
        const statusSnapshot = await getDocs(statusCol);
         if (statusSnapshot.empty) {
            // If firestore is empty, use local data
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
      amount: 100,
    },
  });

  const selectedNetwork = form.watch('network');

  const currentNetworkStatus = useMemo(
    () => networkStatuses?.find(s => s.id === selectedNetwork),
    [networkStatuses, selectedNetwork]
  );

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

  async function onSubmit(data: FormData) {
    if (user) {
        const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
        const transactionData = {
          type: 'Airtime Purchase',
          network: data.network,
          amount: data.amount,
          details: 'Airtime Top-up',
          recipientPhone: data.phone,
          status: 'Pending',
          createdAt: serverTimestamp(),
        };
        const newDocRef = await addDocumentNonBlocking(transactionsRef, transactionData);
        
        if (newDocRef) {
            setTimeout(() => {
                updateDoc(newDocRef, { status: 'Completed' });
            }, 120000); // 2 minutes
        }
      }

    const networkName =
      networkProviders.find((p) => p.id === data.network)?.name ||
      data.network;

    const message = `Hello DataConnect,

I would like to purchase airtime.

Service: Airtime Purchase
Network: ${networkName}
Amount: ₦${data.amount.toLocaleString()}
Recipient Phone Number: ${data.phone}

My Details:
Name: ${data.name}
${data.email ? `Email: ${data.email}` : ''}

Please proceed with the top-up. Thank you.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, '_blank');
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
          Buy Airtime
        </CardTitle>
        <CardDescription className="text-center">
          Top up any phone number instantly.
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
                      onValueChange={field.onChange}
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

            <div className="space-y-4">
              <p className="text-lg font-semibold font-headline">
                2. Enter Details
              </p>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₦)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tunde Ednut" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="For receipt"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch space-y-4">
            <p className="text-center text-xs text-muted-foreground">
              You will be redirected to WhatsApp to complete your purchase.
            </p>
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 font-bold rounded-full shadow-lg transition-transform hover:scale-105"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              Buy Airtime Now
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
