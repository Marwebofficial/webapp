'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from '@/firebase';
import { getFundingInfo, siteConfig } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';

const NIGERIAN_BANKS = [
    "Access Bank",
    "Citibank",
    "Ecobank",
    "Fidelity Bank",
    "First Bank",
    "First City Monument Bank (FCMB)",
    "GTBank (Guaranty Trust Bank)",
    "Heritage Bank",
    "Keystone Bank",
    "Kuda Bank",
    "Opay",
    "Palmpay",
    "Polaris Bank",
    "Stanbic IBTC Bank",
    "Standard Chartered Bank",
    "Sterling Bank",
    "Suntrust Bank",
    "Union Bank",
    "United Bank for Africa (UBA)",
    "Unity Bank",
    "Wema Bank",
    "Zenith Bank",
];

const fundingFormSchema = z.object({
  amount: z.coerce.number().min(100, { message: "Amount must be at least ₦100" }),
  bankName: z.string({
    required_error: "Please select a bank.",
  }),
});

const ACCOUNT_DETAILS = {
    bank: "Palmpay",
    accountName: "onyeka marvelous",
    accountNumber: "09040367103",
};

type FundingFormData = z.infer<typeof fundingFormSchema>;

export function FundWalletDialog({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<FundingFormData>({
        resolver: zodResolver(fundingFormSchema),
        defaultValues: {
          amount: 100,
        },
      });

      const amount = form.watch('amount');
      const { amountToReceive, charge } = getFundingInfo(amount);

      const onSubmit = async (data: FundingFormData) => {
          if (!user) {
            toast({ title: 'Error', description: 'Please log in to continue.', variant: 'destructive' });
            return;
          }
      
          const message = `
            *New Funding Request*
      
            *Email:* ${user.email}
            *Amount to Fund:* ₦${data.amount.toLocaleString()}
            *Sender's Bank:* ${data.bankName}
            *Amount to be Credited:* ₦${amountToReceive.toLocaleString()}
      
            Please confirm the payment and credit the user's wallet.
          `;
      
          const whatsappUrl = `https://wa.me/${siteConfig.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          toast({
              title: 'Request Sent',
              description: 'Your funding request has been sent for processing. Please complete the transfer.',
          });
        };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fund Your Wallet</DialogTitle>
          <DialogDescription>
            Complete the form to get our bank details and send your funding request.
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
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Bank Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NIGERIAN_BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

           <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Charge:</span>
                    <span className="font-medium">₦{charge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                    <span>You will be credited:</span>
                    <span>₦{amountToReceive.toLocaleString()}</span>
                </div>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Bank Details</AlertTitle>
                <AlertDescription>
                   <p><strong>Bank:</strong> {ACCOUNT_DETAILS.bank}</p>
                   <p><strong>Account Name:</strong> {ACCOUNT_DETAILS.accountName}</p>
                   <p><strong>Account Number:</strong> {ACCOUNT_DETAILS.accountNumber}</p>
                </AlertDescription>
            </Alert>
            
            <DialogFooter className="gap-2 sm:justify-end">
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
                 <Button type="submit">Send Request via WhatsApp</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
