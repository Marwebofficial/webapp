"use client";

import { useState, useMemo } from 'react';
import { useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { addAnnouncement, deleteAnnouncement, updateAnnouncement } from "@/firebase/firestore/announcements";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Edit } from 'lucide-react';

export function AnnouncementManager() {
    const firestore = useFirestore();
    const [editing, setEditing] = useState<any>(null);

    const announcementQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, "announcements"), orderBy("createdAt", "desc"));
    }, [firestore]);

    const { data: announcements, isLoading } = useCollection(announcementQuery);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = { message: formData.get('message') as string };
        if (editing) {
            await updateAnnouncement(editing.id, data);
        } else {
            await addAnnouncement(data);
        }
        setEditing(null);
        e.currentTarget.reset();
    };

    return (
        <Card>
            <CardHeader><CardTitle>{editing ? 'Edit' : 'Create'} Announcement</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input name="message" placeholder="Announcement Message" defaultValue={editing?.message || ''} required />
                    <div className="flex space-x-2">
                        <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                        {editing && <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>}
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Table>
                    <TableHeader><TableRow><TableHead>Message</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={2}>Loading...</TableCell></TableRow>
                        ) : announcements?.map((ann: any) => (
                            <TableRow key={ann.id}>
                                <TableCell>{ann.message}</TableCell>
                                <TableCell className="space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => setEditing(ann)}><Edit className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Delete this announcement?</AlertDialogTitle></AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteAnnouncement(ann.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardFooter>
        </Card>
    );
}
