
"use client";

import { useState, useMemo } from 'react';
import { useFirestore } from "@/firebase";
import { collection, query, orderBy, doc, getDoc, updateDoc } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { deleteUser, clearUserWallet } from "@/firebase/firestore/users";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Trash2, Wallet, X } from 'lucide-react';

export function UserManagement() {
    const firestore = useFirestore();
    const [search, setSearch] = useState('');
    const [amountToClear, setAmountToClear] = useState('');

    const usersQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, "users"), orderBy("name", "desc"));
    }, [firestore]);

    const { data: users, isLoading, error } = useCollection(usersQuery);

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(user =>
            (user.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(search.toLowerCase())
        );
    }, [users, search]);

    const handleDelete = async (id: string) => {
        try {
            await deleteUser(id);
            alert('User deleted successfully!');
        } catch (error) {
            console.error("Error deleting user: ", error);
            if (error instanceof Error) {
                alert(`Failed to delete user: ${error.message}`);
            } else {
                alert('Failed to delete user: An unknown error occurred');
            }
        }
    };

    const handleClearBalance = async (userId: string) => {
        try {
            await clearUserWallet(userId);
            alert('Wallet balance cleared successfully!');
        } catch (error) {
            console.error("Error clearing wallet balance: ", error);
            if (error instanceof Error) {
                alert(`Failed to clear wallet balance: ${error.message}`);
            } else {
                alert('Failed to clear wallet balance: An unknown error occurred');
            }
        }
    };
    
    const handleClearSpecificAmount = async (userId: string, amountString: string) => {
        const amount = parseFloat(amountString);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid positive amount.');
            return;
        }
    
        const userRef = doc(firestore, 'users', userId);
        
        try {
            const userDoc = await getDoc(userRef);
    
            if (userDoc.exists()) {
                const currentBalance = userDoc.data().walletBalance || 0;
                if (amount > currentBalance) {
                    alert('Amount to clear cannot be greater than the current wallet balance.');
                    return;
                }
                const newBalance = Math.max(0, currentBalance - amount);
                await updateDoc(userRef, { walletBalance: newBalance });
                alert(`Successfully cleared ₦${amount}. New balance is ₦${newBalance.toLocaleString()}.`);
            } else {
                alert('User document not found.');
            }
        } catch (error) {
            console.error("Error clearing specific amount: ", error);
            if (error instanceof Error) {
                alert(`Failed to clear specific amount: ${error.message}`);
            } else {
                alert('Failed to clear specific amount: An unknown error occurred');
            }
        }
        setAmountToClear(''); // Reset the input
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Input
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-4"
                />
                {error && <p className='text-red-500'>{error instanceof Error ? error.message : 'An unknown error occurred'}</p>}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Wallet Balance</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5}>Loading users...</TableCell></TableRow>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name || 'N/A'}</TableCell>
                                    <TableCell>{user.email || 'N/A'}</TableCell>
                                    <TableCell>{user.role || 'user'}</TableCell>
                                    <TableCell>₦{user.walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</TableCell>
                                    <TableCell className='space-x-2'>
                                        <AlertDialog>
                                             <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm"><Wallet className="h-4 w-4 mr-2"/>Clear Balance</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Clear Balance</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will clear the user's entire wallet balance. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleClearBalance(user.id)}>Clear All Balance</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <AlertDialog onOpenChange={() => setAmountToClear('')}>
                                             <AlertDialogTrigger asChild>
                                                <Button variant="secondary" size="sm"><X className="h-4 w-4 mr-2"/>Clear Specific</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Clear Specific Amount</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Enter the amount to clear from {user.name}'s wallet.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <Input 
                                                    type='number' 
                                                    placeholder='e.g., 500'
                                                    value={amountToClear}
                                                    onChange={(e) => setAmountToClear(e.target.value)}
                                                />
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleClearSpecificAmount(user.id, amountToClear)}>Clear Amount</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the user.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(user.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5}>No users found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
