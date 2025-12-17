"use client";

import { useState, useMemo } from 'react';
import { useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { addPlan, deletePlan, updatePlan } from "@/firebase/firestore/plans";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Trash2, Edit, PlusCircle } from 'lucide-react';

interface Provider {
    id: string;
    name: string;
}

interface PlansManagerProps {
    title: string;
    providers: Provider[];
    collectionName: string;
    isTvPlan?: boolean;
}

export function PlansManager({ title, providers, collectionName, isTvPlan = false }: PlansManagerProps) {
    const firestore = useFirestore();
    const [editing, setEditing] = useState<any>(null);

    const plansQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, collectionName), orderBy("price"));
    }, [firestore, collectionName]);

    const { data: plans, isLoading } = useCollection(plansQuery);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = {
            name: formData.get('name') as string,
            price: Number(formData.get('price')),
            provider: formData.get('provider') as string,
        };
        if (isTvPlan) {
            data.channels = formData.get('channels') as string;
        } else {
            data.speed = formData.get('speed') as string;
        }

        if (editing) {
            await updatePlan(collectionName, editing.id, data);
        } else {
            await addPlan(collectionName, data);
        }
        setEditing(null);
        e.currentTarget.reset();
    };

    if (!providers || providers.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No providers configured for this plan type.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{editing ? 'Edit' : 'Create'} {title.slice(0, -1)}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input name="name" placeholder="Plan Name" defaultValue={editing?.name || ''} required />
                    <Input name="price" type="number" placeholder="Price" defaultValue={editing?.price || ''} required />
                    <Select name="provider" defaultValue={editing?.provider || ''}>
                        <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                        <SelectContent>
                            {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {isTvPlan ? (
                        <Input name="channels" placeholder="Channels" defaultValue={editing?.channels || ''} />
                    ) : (
                        <Input name="speed" placeholder="Speed (e.g., 100 Mbps)" defaultValue={editing?.speed || ''} />
                    )}
                    <div className="flex space-x-2">
                        <Button type="submit"><PlusCircle className="h-4 w-4 mr-2" />{editing ? 'Update Plan' : 'Create Plan'}</Button>
                        {editing && <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>}
                    </div>
                </form>
            </CardContent>
             <CardFooter>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>{isTvPlan ? 'Channels' : 'Speed'}</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {isLoading ? (
                            <TableRow><TableCell colSpan={5}>Loading plans...</TableCell></TableRow>
                        ) : plans && plans.length > 0 ? (
                            plans.map((plan: any) => (
                                <TableRow key={plan.id}>
                                    <TableCell>{plan.name}</TableCell>
                                    <TableCell>{providers.find(p => p.id === plan.provider)?.name}</TableCell>
                                    <TableCell>${plan.price}</TableCell>
                                    <TableCell>{isTvPlan ? plan.channels : plan.speed}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditing(plan)}><Edit className="h-4 w-4" /></Button>
                                        <AlertDialog>
                                             <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the plan.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deletePlan(collectionName, plan.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow><TableCell colSpan={5}>No plans created yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardFooter>
        </Card>
    );
}
