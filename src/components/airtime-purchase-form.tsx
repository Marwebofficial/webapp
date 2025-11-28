
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
import { networkProviders, type Network } from '@/lib/data-plans';
import { NetworkIcon } from './network-icons';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';

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

export function AirtimePurchaseForm() {
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
      amount: 100,
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
                  <FormLabel className="text-lg font-semibold font-headline">
                    1. Select Network
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
          <CardFooter>
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
