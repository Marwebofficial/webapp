
'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Megaphone } from 'lucide-react';

interface Announcement {
    text: string;
    enabled: boolean;
}

export function AnnouncementBanner() {
    const firestore = useFirestore();
    const announcementRef = useMemoFirebase(
        () => doc(firestore, 'announcement', 'current'),
        [firestore]
    );
    const { data: announcement } = useDoc<Announcement>(announcementRef);

    if (!announcement || !announcement.enabled || !announcement.text) {
        return null;
    }

    return (
        <div className="bg-destructive text-destructive-foreground">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-10">
                    <div className="flex items-center">
                        <Megaphone className="w-5 h-5 mr-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{announcement.text}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
