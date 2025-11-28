
"use client";

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { doc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';

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
  tvPlans,
  tvProviders,
  type TvPlan,
  type TvProviderId,
} from '@/lib/tv-plans';
import { TvProviderIcon } from './tv-provider-icons';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';

const WHATSAPP_NUMBER = '2349040367103';

const FormSchema = z.object({
  provider: z.custom<TvProviderId>(
    (val) => tvProviders.some((p) => p.id === val),
    {
      message: 'Please select a TV provider.',
    }
  ),
  plan: z.string().min(1, 'Please select a subscription plan.'),
  smartCardNumber: z
    .string()
    .min(10, 'Please enter a valid Smart Card/IUC number.')
    .max(15, 'Please enter a valid Smart Card/IUC number.'),
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50),
  phone: z
    .string()
    .regex(
      /^(\+234|0)?[7-9][01]\d{8}$/,
      'Please enter a valid Nigerian phone number.'
    ),
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

export function TvSubscriptionForm() {
  const [selectedProvider, setSelectedProvider] = useState<TvProviderId | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<TvPlan | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      smartCardNumber: '',
    },
  });

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

  const handleProviderChange = (providerId: TvProviderId) => {
    setSelectedProvider(providerId);
    form.setValue('provider', providerId);
    setSelectedPlan(null); // Reset plan when provider changes
    form.resetField('plan');
  };

  const handlePlanSelect = (plan: TvPlan) => {
    setSelectedPlan(plan);
    form.setValue('plan', plan.id, { shouldValidate: true });
  };

  async function onSubmit(data: FormData) {
    const planDetails = tvPlans[data.provider].find(
      (p) => p.id === data.plan
    );
    if (!planDetails) {
      toast({
        title: 'Error',
        description: 'Selected plan not found. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (user) {
      const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
      const transactionData = {
        type: 'TV Subscription',
        network: data.provider,
        amount: planDetails.price,
        details: planDetails.label,
        recipientPhone: data.smartCardNumber,
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

    const providerName =
      tvProviders.find((p) => p.id === data.provider)?.name ||
      data.provider;

    const message = `Hello DataConnect,

I would like to subscribe for a TV plan.

Service: TV Subscription
Provider: ${providerName}
Plan: ${planDetails.label} (₦${planDetails.price.toLocaleString()})
Smart Card/IUC Number: ${data.smartCardNumber}

My Details:
Name: ${data.name}
Phone: ${data.phone}
${data.email ? `Email: ${data.email}` : ''}

Please proceed with the subscription. Thank you.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, '_blank');
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center">
          TV Subscription
        </CardTitle>
        <CardDescription className="text-center">
          Renew your DStv, GOtv, and StarTimes subscription instantly.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold font-headline">
                    1. Select TV Provider
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value: string) =>
                        handleProviderChange(value as TvProviderId)
                      }
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      {tvProviders.map((provider) => (
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
                            <TvProviderIcon
                              provider={provider.id}
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

            {selectedProvider && (
              <div className="animate-in fade-in-20 duration-300">
                <FormField
                  control={form.control}
                  name="plan"
                  render={() => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg font-semibold font-headline">
                        2. Choose Subscription Plan
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {tvPlans[selectedProvider].map((plan) => (
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
                              <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                                <p className="font-bold text-lg text-primary">
                                  {plan.label}
                                </p>
                                <p className="text-muted-foreground font-semibold">
                                  ₦{plan.price.toLocaleString()}
                                </p>
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
                3. Your Details
              </p>
               <FormField
                control={form.control}
                name="smartCardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Smart Card / IUC Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Smart Card or IUC number" {...field} />
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
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 font-bold rounded-full shadow-lg transition-transform hover:scale-105"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              Subscribe Now
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
