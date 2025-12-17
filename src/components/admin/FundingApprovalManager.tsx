"use client";

import { useMemo } from 'react';
import { useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { updateFundingRequest } from "@/firebase/firestore/funding";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FundingApprovalManager() {
    const firestore = useFirestore();

    const fundingQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, "funding"), where("status", "==", "pending"));
    }, [firestore]);

    const { data: fundingRequests, isLoading } = useCollection(fundingQuery);

    const handleApproval = async (id: string, approve: boolean) => {
        const status = approve ? "approved" : "denied";
        await updateFundingRequest(id, { status });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Funding Approvals</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User Email</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4}>Loading funding requests...</TableCell></TableRow>
                        ) : fundingRequests && fundingRequests.length > 0 ? (
                            fundingRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.userEmail}</TableCell>
                                    <TableCell>${request.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                                            {request.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        <Button size="sm" onClick={() => handleApproval(request.id, true)}>Approve</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleApproval(request.id, false)}>Deny</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={4}>No pending funding requests.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
