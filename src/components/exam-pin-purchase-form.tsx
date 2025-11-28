
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
  examPinProviders,
  type ExamPin,
  type ExamPinProviderId,
} from '@/lib/exam-pins';
import { ExamProviderIcon } from './exam-provider-icons';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, useCollection } from '@/firebase';
import { Skeleton } from './ui/skeleton';

const WHATSAPP_NUMBER = '2349040367103';

const FormSchema = z.object({
  provider: z.custom<ExamPinProviderId>(
    (val) => examPinProviders.some((p) => p.id === val),
    {
      message: 'Please select an exam provider.',
    }
  ),
  pin: z.string().min(1, 'Please select a pin type.'),
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

export function ExamPinPurchaseForm() {
  const [selectedProvider, setSelectedProvider] = useState<ExamPinProviderId | null>(null);
  const [selectedPin, setSelectedPin] = useState<ExamPin | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  
  const examPinsQuery = useMemoFirebase(
    () => (firestore && selectedProvider ? collection(firestore, 'examPins', selectedProvider, 'pins') : null),
    [firestore, selectedProvider]
  );
  const { data: examPins, isLoading: isLoadingPins } = useCollection<ExamPin>(examPinsQuery);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
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

  const handleProviderChange = (providerId: ExamPinProviderId) => {
    setSelectedProvider(providerId);
    form.setValue('provider', providerId);
    setSelectedPin(null);
    form.resetField('pin');
  };

  const handlePinSelect = (pin: ExamPin) => {
    setSelectedPin(pin);
    form.setValue('pin', pin.id, { shouldValidate: true });
  };

  async function onSubmit(data: FormData) {
    if(!examPins) return;
    const pinDetails = examPins.find(
      (p) => p.id === data.pin
    );
    if (!pinDetails) {
      toast({
        title: 'Error',
        description: 'Selected pin not found. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (user) {
      const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
      const transactionData = {
        type: 'Exam Pin Purchase',
        network: data.provider,
        amount: pinDetails.price,
        details: pinDetails.label,
        recipientPhone: data.phone, // Using phone as a recipient identifier
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
      examPinProviders.find((p) => p.id === data.provider)?.name ||
      data.provider;

    const message = `Hello DataConnect,

I would like to purchase an Exam Pin.

Service: Exam Pin Purchase
Provider: ${providerName}
Pin Type: ${pinDetails.label} (₦${pinDetails.price.toLocaleString()})

My Details:
Name: ${data.name}
Phone: ${data.phone}
${data.email ? `Email: ${data.email} (for pin delivery)` : ''}

Please proceed with the purchase. Thank you.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, '_blank');
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center">
          Buy Exam Pins
        </CardTitle>
        <CardDescription className="text-center">
          Get your WAEC and NECO result checker pins instantly.
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
                    1. Select Exam Body
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value: string) =>
                        handleProviderChange(value as ExamPinProviderId)
                      }
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      {examPinProviders.map((provider) => (
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
                            <ExamProviderIcon
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
                  name="pin"
                  render={() => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg font-semibold font-headline">
                        2. Choose Pin Type
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {isLoadingPins && (
                            <>
                              <Skeleton className="h-24 w-full" />
                              <Skeleton className="h-24 w-full" />
                            </>
                          )}
                          {examPins && examPins.length > 0 ? (
                            examPins.map((pin) => (
                              <Card
                                key={pin.id}
                                onClick={() => handlePinSelect(pin)}
                                className={cn(
                                  'cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1',
                                  selectedPin?.id === pin.id
                                    ? 'border-primary ring-2 ring-primary'
                                    : 'border-border'
                                )}
                              >
                                <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                                  <p className="font-bold text-lg text-primary">
                                    {pin.label}
                                  </p>
                                  <p className="text-muted-foreground font-semibold">
                                    ₦{pin.price.toLocaleString()}
                                  </p>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                             <p className="text-muted-foreground col-span-full text-center">No pins found for this provider.</p>
                          )}
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
                      <FormLabel>Email (for Pin Delivery)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="e.g., you@example.com"
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
              Buy Pin Now
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
