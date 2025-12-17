"use client";

import { useMemo } from 'react';
import { useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { deleteReview } from "@/firebase/firestore/reviews";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';

export function ReviewManager() {
    const firestore = useFirestore();

    const reviewsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, "reviews"), orderBy("createdAt", "desc"));
    }, [firestore]);

    const { data: reviews, isLoading } = useCollection(reviewsQuery);

    return (
        <Card>
            <CardHeader><CardTitle>Review Management</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Rating</TableHead><TableHead>Comment</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                     <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4}>Loading reviews...</TableCell></TableRow>
                        ) : reviews && reviews.length > 0 ? (
                            reviews.map((review: any) => (
                                <TableRow key={review.id}>
                                    <TableCell>{review.userName || 'Anonymous'}</TableCell>
                                    <TableCell>{review.rating} / 5</TableCell>
                                    <TableCell>{review.comment}</TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the review.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteReview(review.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={4}>No reviews yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
