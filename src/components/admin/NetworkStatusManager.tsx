"use client";

import { useState, useMemo } from 'react';
import { useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { addNetworkStatus, deleteNetworkStatus, updateNetworkStatus } from "@/firebase/firestore/network-status";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

export function NetworkStatusManager() {
    const firestore = useFirestore();
    const [editing, setEditing] = useState<any>(null);

    const statusQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, "networkStatus"), orderBy("createdAt", "desc"));
    }, [firestore]);

    const { data: statuses, isLoading } = useCollection(statusQuery);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = { 
            message: formData.get('message') as string,
            status: formData.get('status') as string
        };
        if (editing) {
            await updateNetworkStatus(editing.id, data);
        } else {
            await addNetworkStatus(data);
        }
        setEditing(null);
        e.currentTarget.reset();
    };

    return (
        <Card>
            <CardHeader><CardTitle>{editing ? 'Edit' : 'Create'} Network Status</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input name="message" placeholder="Status Message" defaultValue={editing?.message || ''} required />
                    <Select name="status" defaultValue={editing?.status || 'operational'}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="operational">Operational</SelectItem>
                            <SelectItem value="degraded">Degraded</SelectItem>
                            <SelectItem value="outage">Outage</SelectItem>
                        </SelectContent>
                    </Select>
                     <div className="flex space-x-2">
                        <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                        {editing && <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>}
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Table>
                    <TableHeader><TableRow><TableHead>Message</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                        ) : statuses?.map((s: any) => (
                             <TableRow key={s.id}>
                                <TableCell>{s.message}</TableCell>
                                <TableCell><Badge>{s.status}</Badge></TableCell>
                                <TableCell className="space-x-2">
                                     <Button variant="outline" size="sm" onClick={() => setEditing(s)}><Edit className="h-4 w-4" /></Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Delete this status?</AlertDialogTitle></AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteNetworkStatus(s.id)}>Delete</AlertDialogAction>
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
