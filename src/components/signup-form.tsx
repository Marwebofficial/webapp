'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { doc, serverTimestamp } from 'firebase/firestore';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';

const FormSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters.',
    }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(6, {
        message: 'Password must be at least 6 characters.',
    }),
});

export function SignupForm() {
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        try {
            // Non-blocking call
            initiateEmailSignUp(auth, data.email, data.password);

            auth.onAuthStateChanged(user => {
                if (user) {
                    const userProfile = {
                        id: user.uid,
                        name: data.name,
                        email: data.email,
                        createdAt: serverTimestamp(),
                    };
                    const userDocRef = doc(firestore, 'users', user.uid);
                    setDocumentNonBlocking(userDocRef, userProfile, { merge: true });
                    
                    toast({
                        title: 'Account Created',
                        description: "You've been successfully signed up.",
                    });
                    router.push('/');
                }
            });

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description:
                error.message || 'There was a problem with your request.',
            });
        }
    };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
        <CardDescription>
          Enter your details below to get started.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-4">
          <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <div className="px-6 pb-6">
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
            <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
}
