
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
import { Label } from '@/components/ui/label';
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

const fundingSchema = z.object({
  amount: z.coerce
    .number()
    .min(100, 'Minimum funding amount is ₦100.')
    .max(50000, 'Maximum funding amount is ₦50,000.'),
});

type FundingFormData = z.infer<typeof fundingSchema>;

export function FundWalletDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FundingFormData>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      amount: 1000,
    },
  });

  const amount = form.watch('amount');
  const charge = amount * 0.01;
  const amountToReceive = amount - charge;

  const onSubmit = (data: FundingFormData) => {
    // TODO: Implement the actual funding logic
    console.log('Funding request:', data);
    toast({
      title: 'Proceeding to Funding',
      description: 'You will be redirected to complete the payment.',
    });
    setOpen(false); // Close the dialog for now
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fund Your Wallet</DialogTitle>
          <DialogDescription>
            Enter the amount you want to add to your wallet. A 1% processing fee will be applied.
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
                Proceed to Fund
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
