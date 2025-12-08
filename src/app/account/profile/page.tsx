
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, User as UserIcon, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (user) {
      form.setValue('name', user.displayName || '');
    }
  }, [user, isUserLoading, router, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user || !userDocRef) return;

    setIsSubmitting(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: data.name });

      // Update Firestore document
      await updateDoc(userDocRef, { name: data.name });

      toast({
        title: 'Profile updated!',
        description: 'Your name has been successfully changed.',
      });
      // Force a refresh of the user object in the auth context if needed,
      // although onAuthStateChanged should handle it.
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 py-8 md:p-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-28 ml-auto" />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 py-8 md:p-12">
       <div className="max-w-2xl mx-auto mb-8">
            <Button asChild variant="ghost">
                <Link href="/account">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Account
                </Link>
            </Button>
        </div>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Manage Your Profile</CardTitle>
          <CardDescription>View your account details and update your information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
             <h3 className="text-lg font-semibold">Account Information</h3>
             <div className="space-y-3 rounded-md border p-4">
                <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{userProfile?.phoneNumber || 'Not provided'}</span>
                </div>
             </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="text-lg font-semibold">Update Your Name</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Input placeholder="Your display name" {...field} />
                      </FormControl>
                      <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}

    