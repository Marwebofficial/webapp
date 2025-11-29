
'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface Announcement {
    text: string;
    enabled: boolean;
}

export function AnnouncementBanner() {
    const firestore = useFirestore();
    const announcementRef = useMemoFirebase(
        () => firestore ? doc(firestore, 'announcement', 'current') : null,
        [firestore]
    );
    const { data: announcement, isLoading } = useDoc<Announcement>(announcementRef);

    if (isLoading) {
        return (
            <div className="bg-blue-600 text-white p-3 text-center text-sm font-medium">
                <Skeleton className="h-5 w-1/2 mx-auto bg-blue-400" />
            </div>
        );
    }
    
    if (!announcement || !announcement.enabled || !announcement.text) {
        return null;
    }

    return (
        <div className="bg-blue-600 text-white p-3 text-center text-sm font-medium flex items-center justify-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{announcement.text}</span>
        </div>
    );
}
