'use client';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/client-provider';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
    photoURL?: string;
}

export function AccountInfo() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(
        () => (user ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    if (!user) return null;

    const photoURL = userProfile?.photoURL || user.photoURL;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback className="text-2xl">
                            {user.displayName ? user.displayName.charAt(0) : <UserIcon />}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </div>
                </div>
                <Button asChild variant="outline">
                    <Link href="/account/profile">
                        <Edit className="mr-2 h-4 w-4" />
                        Manage Profile
                    </Link>
                </Button>
            </CardHeader>
        </Card>
    );
}
