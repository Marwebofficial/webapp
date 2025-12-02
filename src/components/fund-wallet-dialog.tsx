
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Copy, Mail } from 'lucide-react';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';

const fundingSchema = z.object({
  amount: z.coerce
    .number()
    .min(100, 'Minimum funding amount is ₦100.')
    .max(50000, 'Maximum funding amount is ₦50,000.'),
});

type FundingFormData = z.infer<typeof fundingSchema>;

const ACCOUNT_NUMBER = '9040367103';
const BANK_NAME = 'Palmpay';
const ACCOUNT_NAME = 'Onyeka Marvelous';
const ADMIN_EMAIL = 'samuelmarvel21@gmail.com';

interface UserProfile {
  phoneNumber: string;
}

export function FundWalletDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [fundingStep, setFundingStep] = useState<'amount' | 'details'>('amount');
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);


  const form = useForm<FundingFormData>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      amount: 1000,
    },
  });

  const amount = form.watch('amount');
  const charge = amount * 0.01;
  const amountToReceive = amount - charge;

  const onSubmit = () => {
    setFundingStep('details');
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset to the first step when the dialog is closed
      setTimeout(() => {
        form.reset();
        setFundingStep('amount');
      }, 300);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${text} copied to clipboard.`,
    });
  }

  const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
    `Wallet Funding Request - ₦${amount}`
  )}&body=${encodeURIComponent(
    `Hello Admin,\n\nI have just sent ₦${amount.toLocaleString()} for my wallet funding.\n\nMy Details:\nName: ${user?.displayName || 'N/A'}\nPhone: ${userProfile?.phoneNumber || 'N/A'}\n\nPlease credit my wallet. Thank you.`
  )}`;


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {fundingStep === 'amount' ? (
          <>
            <DialogHeader>
              <DialogTitle>Fund Your Wallet</DialogTitle>
              <DialogDescription>
                Enter the amount you want to add. A 1% processing fee will be applied.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount to Fund (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2 rounded-md border bg-secondary/50 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Fee (1%):</span>
                    <span className="font-medium">₦{charge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>You will receive:</span>
                    <span className="text-primary">₦{amountToReceive.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="ghost">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={!form.formState.isValid}>
                    Proceed
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Transfer</DialogTitle>
              <DialogDescription>
                Transfer the exact amount below, then click the 'Notify Admin' button.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Amount to Transfer</p>
                    <p className="text-3xl font-bold tracking-tight">₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="space-y-3 rounded-md border bg-background p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-muted-foreground">Account Number</p>
                            <p className="font-mono font-semibold">{ACCOUNT_NUMBER}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(ACCOUNT_NUMBER)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                     <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-muted-foreground">Bank Name</p>
                            <p className="font-semibold">{BANK_NAME}</p>
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => copyToClipboard(BANK_NAME)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                     <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-muted-foreground">Account Name</p>
                            <p className="font-semibold">{ACCOUNT_NAME}</p>
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => copyToClipboard(ACCOUNT_NAME)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <Button asChild className="w-full">
                  <Link href={mailtoLink}>
                    <Mail className="mr-2 h-4 w-4" />
                    Notify Admin of Transfer
                  </Link>
                </Button>
            </div>
            <DialogFooter className="sm:justify-between gap-2">
              <Button variant="outline" onClick={() => setFundingStep('amount')}>
                Go Back
              </Button>
              <DialogClose asChild>
                <Button type="button">
                  Done
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
