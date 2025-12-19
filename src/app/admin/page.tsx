'use client';

import { useMemo } from 'react';
import { UserManagement } from "@/components/admin/UserManagement";
import { FundingApprovalManager } from "@/components/admin/FundingApprovalManager";
import { BlogManager } from "@/components/admin/BlogManager";
import { AnnouncementManager } from "@/components/admin/AnnouncementManager";
import { NetworkStatusManager } from "@/components/admin/NetworkStatusManager";
import { ReviewManager } from "@/components/admin/ReviewManager";
import { PlansManager } from "@/components/admin/PlansManager";
import { networkProviders } from "@/lib/data-plans";
import { useUser } from "@/firebase/provider";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";

export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemo(() => {
        if (!user) return null;
        return doc(firestore, "users", user.uid);
    }, [firestore, user]);

    const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

    const isLoading = isUserLoading || isUserDataLoading;
    const isAdmin = userData?.role === "admin";

    if (isLoading) {
        return <div className="container mx-auto p-4 text-center">Loading...</div>;
    }

    if (!isAdmin) {
        return <div className="container mx-auto p-4 text-center">You are not authorized to view this page.</div>;
    }

    return (
        <div className="container mx-auto p-4 py-8 md:p-12 space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <UserManagement />
            <FundingApprovalManager />
            <BlogManager />
            <AnnouncementManager />
            <NetworkStatusManager />
            <ReviewManager />
            <PlansManager title="Data Plans" providers={networkProviders} collectionName="dataPlans" />
        </div>
    );
}