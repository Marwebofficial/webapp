
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
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from './ui/skeleton';
import { useRouter } from 'next/navigation';
import { PinDialog } from './PinDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { tvProviders, tvPlans as allTvPlans } from '@/lib/tv-providers';

const FormSchema = z.object({
    tvProvider: z.string().min(1, "Please select a TV provider."),
    smartCardNumber: z.string().min(10, "Please enter a valid smart card number."),
    plan: z.string().min(1, "Please select a plan."),
});

type FormData = z.infer<typeof FormSchema>;

interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  walletBalance?: number;
  pin?: string;
}

interface TvProvider {
    id: string;
    name: string;
}

interface TvPlan {
    id: string;
    name: string;
    amount: number;
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

export function TvPurchaseForm() {
  const [tvPlans, setTvPlans] = useState<TvPlan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
  });

  const selectedTvProvider = form.watch("tvProvider");

  useEffect(() => {
      if (selectedTvProvider) {
          setTvPlans(allTvPlans[selectedTvProvider as keyof typeof allTvPlans] || []);
          form.resetField('plan');
      }
  }, [selectedTvProvider, form]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handlePurchase = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
        const errorField = Object.keys(form.formState.errors)[0] as keyof FormData;
        if (errorField) {
            toast({
                title: 'Invalid Input',
                description: form.formState.errors[errorField]?.message,
                variant: 'destructive',
            });
        }
        return;
    }

    if (!userProfile?.pin) {
        toast({
            title: "Set Transaction PIN",
            description: "Please set your transaction PIN in your profile before making a purchase.",
            variant: "destructive",
        });
        router.push('/account/profile');
        return;
    }
    setFormData(form.getValues());
    setIsPinDialogOpen(true);
  };

  async function processTransaction(pin: string) {
    if (!formData || !user || !firestore) return;

    if (userProfile?.pin !== pin) {
        toast({
            title: "Invalid PIN",
            description: "The PIN you entered is incorrect. Please try again.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);
    setIsPinDialogOpen(false);

    const planDetails = tvPlans.find(p => p.id === formData.plan);
    if (!planDetails) {
      toast({ title: 'Error', description: 'Selected plan not found. Please try again.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const price = planDetails.amount;

    if (!userProfile || (userProfile.walletBalance || 0) < price) {
        toast({
            title: 'Insufficient Funds',
            description: `Your wallet balance is too low for this transaction. Please fund your wallet and try again.`,
            variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
    }

    try {
      const batch = writeBatch(firestore);
      const userRef = doc(firestore, 'users', user.uid);
      const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));

      batch.update(userRef, { walletBalance: increment(-price) });
      
      batch.set(transactionRef, {
          type: 'TV Subscription',
          provider: formData.tvProvider,
          amount: price,
          details: planDetails.name,
          recipientSmartCard: formData.smartCardNumber,
          status: 'Completed',
          createdAt: serverTimestamp(),
      });

      await batch.commit();

      toast({
        title: 'Success',
        description: 'TV subscription successful!',
      });

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
    } finally {
      setIsSubmitting(false);
      setFormData(null);
    }
  }

  if (isUserLoading || !user) {
    return <PurchaseFormSkeleton />;
  }

  return (
    <>
    <Card className="w-full max-w-2xl mx-auto shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center">
          TV Subscription
        </CardTitle>
        <CardDescription className="text-center">
          Pay your TV subscription instantly.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>        
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <p className="text-lg font-semibold font-headline">
                1. Select Provider and Plan
              </p>
              <FormField
                control={form.control}
                name="tvProvider"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>TV Provider</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "w-full justify-between",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value
                                            ? tvProviders.find(
                                                (provider) => provider.id === field.value
                                            )?.name
                                            : "Select a provider"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                                <Command>
                                    <CommandInput placeholder="Search provider..." />
                                    <CommandEmpty>No provider found.</CommandEmpty>
                                    <CommandGroup>
                                        {tvProviders.map((provider) => (
                                            <CommandItem
                                                value={provider.name}
                                                key={provider.id}
                                                onSelect={() => {
                                                    form.setValue("tvProvider", provider.id)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        provider.id === field.value
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {provider.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
                />
                {selectedTvProvider && (
                    <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Plan</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                                ? tvPlans.find(
                                                    (plan) => plan.id === field.value
                                                )?.name
                                                : "Select a plan"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search plan..." />
                                        <CommandEmpty>No plan found.</CommandEmpty>
                                        <CommandGroup>
                                            {tvPlans.map((plan) => (
                                                <CommandItem
                                                    value={plan.name}
                                                    key={plan.id}
                                                    onSelect={() => {
                                                        form.setValue("plan", plan.id)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            plan.id === field.value
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {plan.name} (₦{plan.amount})
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
                <FormField
                control={form.control}
                name="smartCardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Smart Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch space-y-4">
            <Button
              type="button"
              onClick={handlePurchase}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 font-bold rounded-full shadow-lg transition-transform hover:scale-105"
              disabled={isSubmitting}
            >
               {isSubmitting ? 'Processing...' : 'Purchase Plan'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
    <PinDialog 
        open={isPinDialogOpen} 
        onOpenChange={setIsPinDialogOpen} 
        onConfirm={processTransaction} 
        isConfirming={isSubmitting} 
    />
    </>
  );
}
