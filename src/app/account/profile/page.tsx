
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
});

const pinSchema = z.object({
    pin: z.string().length(4, 'PIN must be 4 digits'),
    confirmPin: z.string().length(4, 'PIN must be 4 digits'),
}).refine((data) => data.pin === data.confirmPin, {
    message: "PINs don't match",
    path: ["confirmPin"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PinFormData = z.infer<typeof pinSchema>;

interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  photoURL?: string;
  pin?: string;
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const pinForm = useForm<PinFormData>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
        pin: '',
        confirmPin: '',
    }
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (user) {
      profileForm.setValue('name', user.displayName || '');
    }
  }, [user, isUserLoading, router, profileForm]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user || !userDocRef) return;

    setIsSubmittingProfile(true);
    try {
      const authUpdates: { displayName?: string } = {};
      const firestoreUpdates: { name?: string } = {};

      if (profileForm.formState.dirtyFields.name) {
        authUpdates.displayName = data.name;
        firestoreUpdates.name = data.name;
      }
      
      if (Object.keys(authUpdates).length > 0 && auth.currentUser) {
        await updateProfile(auth.currentUser, authUpdates);
      }
      
      if (Object.keys(firestoreUpdates).length > 0) {
        await updateDoc(userDocRef, firestoreUpdates);
      }

      toast({
        title: 'Profile updated!',
        description: 'Your name has been successfully saved.',
      });
      profileForm.reset({}, { keepValues: true }); // Reset dirty state
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const onPinSubmit = async (data: PinFormData) => {
    if (!user || !userDocRef) return;
    setIsSubmittingPin(true);
    try {
        await updateDoc(userDocRef, { pin: data.pin });
        toast({
            title: 'PIN Updated',
            description: 'Your transaction PIN has been set successfully.',
        });
        pinForm.reset();
    } catch (error: any) {
        console.error('Error updating PIN:', error);
        toast({
            title: 'PIN Update Failed',
            description: error.message || 'Could not update your PIN. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmittingPin(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;
  const photoURL = userProfile?.photoURL || user?.photoURL;

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
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">Manage Your Profile</CardTitle>
            <CardDescription>View your account details and update your information.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                <div className="flex flex-col items-center gap-6">
                  <Avatar className="w-32 h-32 text-4xl">
                      <AvatarImage src={photoURL || undefined} alt={user?.displayName || 'User'} />
                      <AvatarFallback>
                      {user?.displayName ? user.displayName.charAt(0) : <UserIcon />}
                      </AvatarFallback>
                  </Avatar>
                   <div className="w-full space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your display name" {...field} />
                              </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <div className="space-y-3 rounded-md border p-4 bg-secondary/50">
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
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmittingProfile || !profileForm.formState.isDirty}>
                    {isSubmittingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-3xl">Transaction PIN</CardTitle>
                <CardDescription>Set or update your 4-digit transaction PIN for secure payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...pinForm}>
                    <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className='space-y-6'>
                        <FormField
                            control={pinForm.control}
                            name="pin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New PIN</FormLabel>
                                    <FormControl>
                                        <Input type="password" maxLength={4} placeholder="****" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={pinForm.control}
                            name="confirmPin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New PIN</FormLabel>
                                    <FormControl>
                                        <Input type="password" maxLength={4} placeholder="****" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmittingPin || !pinForm.formState.isDirty}>
                                {isSubmittingPin ? 'Saving...' : (userProfile?.pin ? 'Update PIN' : 'Set PIN')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
