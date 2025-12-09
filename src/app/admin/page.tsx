
'use client';

import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, doc, deleteDoc, query, serverTimestamp, writeBatch, increment, updateDoc, orderBy, where } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { networkProviders } from '@/lib/data-plans';
import { tvProviders } from '@/lib/tv-plans';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Megaphone, CheckCircle, WalletCards, PlusCircle, Search, UserCog } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';

interface Plan {
  id: string;
  label: string;
  price: number;
  validity?: string;
}

interface BlogPost {
  id: string;
  title: string;
  createdAt: { seconds: number };
}

const ADMIN_EMAIL = 'samuelmarvel21@gmail.com';

interface Announcement {
    text: string;
    enabled: boolean;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    walletBalance?: number;
    pendingFundingRequest?: {
        amount: number;
        bankName: string;
        userName: string;
        createdAt: { seconds: number, nanoseconds: number };
    }
}

function BlogManager() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const postsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'blogPosts'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: posts, isLoading, error } = useCollection<BlogPost>(postsQuery);

    const handleDelete = async (postId: string) => {
        if (!firestore) return;
        const confirmed = await new Promise((resolve) => {
            const Dialog = () => (
                <AlertDialog open onOpenChange={() => resolve(false)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the blog post.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => resolve(false)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => resolve(true)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
            // This is a bit of a hack to render a dialog confirmation
            // In a real app, you'd use a state management solution for dialogs
            const root = document.createElement('div');
            document.body.appendChild(root);
            const { createRoot } = require('react-dom/client');
            createRoot(root).render(<Dialog />);
        });

        if (confirmed) {
            try {
                await deleteDoc(doc(firestore, 'blogPosts', postId));
                toast({ title: 'Success', description: 'Blog post deleted.' });
            } catch (err: any) {
                toast({ title: 'Error', description: `Could not delete post: ${err.message}`, variant: 'destructive' });
            }
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Blog Management</CardTitle>
                    <CardDescription>Create, edit, and delete blog posts.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/admin/blog/editor">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create New Post
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Date Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center">Loading posts...</TableCell></TableRow>
                        ) : posts && posts.length > 0 ? (
                            posts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium whitespace-nowrap">{post.title}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {post.createdAt ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/blog/editor?slug=${post.id}`}>
                                                <Pencil className="w-4 h-4 mr-2" /> Edit
                                            </Link>
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center">No blog posts found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function UserManagement() {
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isManageUserOpen, setManageUserOpen] = useState(false);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading, error } = useCollection<UserProfile>(usersQuery);

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        if (!searchQuery) return users;
        return users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const handlePasswordReset = async (email: string) => {
        if (!auth) return;
        try {
            await sendPasswordResetEmail(auth, email);
            toast({
                title: 'Password Reset Email Sent',
                description: `An email has been sent to ${email} with instructions to reset their password.`,
            });
            setManageUserOpen(false);
        } catch (error: any) {
            console.error("Password Reset Error: ", error);
            toast({
                title: "Failed to Send Email",
                description: `Could not send password reset email. Error: ${error.message}`,
                variant: 'destructive',
            });
        }
    };
    
    if (error) {
        console.error("Firestore Error in UserManagement: ", error);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Search, view, and manage user accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Wallet Balance</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">Loading users...</TableCell>
                                </TableRow>
                            ) : filteredUsers && filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="font-medium">{user.name}</div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                                        <TableCell className="whitespace-nowrap">₦{(user.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <Button size="sm" variant="outline" onClick={() => { setSelectedUser(user); setManageUserOpen(true); }}>
                                                <UserCog className="w-4 h-4 mr-2"/>
                                                Manage
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No users found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

             <Dialog open={isManageUserOpen} onOpenChange={setManageUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage User: {selectedUser?.name}</DialogTitle>
                        <DialogDescription>
                            Perform administrative actions for this user.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="py-4 space-y-4">
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        Send Password Reset Email
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will send a password reset link to {selectedUser.email}. The user will be required to choose a new password.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handlePasswordReset(selectedUser.email)}>
                                            Yes, Send Email
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                             {/* Add other management actions here */}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}

function FundingApprovalManager() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const usersWithRequestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('pendingFundingRequest', '!=', null));
    }, [firestore]);

    const { data: usersWithRequests, isLoading, error } = useCollection<UserProfile>(usersWithRequestsQuery);

    const handleApprove = async (user: UserProfile) => {
        if (!firestore || !user.pendingFundingRequest) return;

        const amountToCredit = user.pendingFundingRequest.amount * 0.99; // Apply 1% charge
        const userRef = doc(firestore, 'users', user.id);
        const transactionRef = doc(collection(firestore, 'users', user.id, 'transactions'));

        const batch = writeBatch(firestore);

        // Update user's wallet balance and clear the pending request
        batch.update(userRef, {
            walletBalance: increment(amountToCredit),
            pendingFundingRequest: null
        });
        
        // Create a transaction record
        batch.set(transactionRef, {
            type: 'Wallet Funding',
            network: 'system',
            amount: amountToCredit,
            details: `Wallet funded with ₦${user.pendingFundingRequest.amount.toLocaleString()}`,
            recipientPhone: user.id,
            status: 'Completed',
            createdAt: serverTimestamp(),
        });

        try {
            await batch.commit();
            toast({
                title: "Success!",
                description: `${user.name}'s wallet has been credited with ₦${amountToCredit.toLocaleString()}.`,
            });
        } catch (error: any) {
            console.error("Approval Error: ", error);
            toast({
                title: "Approval Failed",
                description: `Could not approve request. Error: ${error.message}`,
                variant: 'destructive',
            });
        }
    };
    
    if (error) {
        console.error("Firestore Error in FundingApprovalManager: ", error);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Wallet Funding Approvals</CardTitle>
                <CardDescription>Review and approve pending wallet funding requests.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Bank</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Loading requests...</TableCell>
                            </TableRow>
                        ) : usersWithRequests && usersWithRequests.length > 0 ? (
                            usersWithRequests.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="whitespace-nowrap">
                                        <div className="font-medium">{user.pendingFundingRequest?.userName || user.name}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">₦{user.pendingFundingRequest?.amount.toLocaleString()}</TableCell>
                                    <TableCell className="whitespace-nowrap">{user.pendingFundingRequest?.bankName}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {user.pendingFundingRequest?.createdAt ?
                                            format(new Date(user.pendingFundingRequest.createdAt.seconds * 1000), "MMM d, yyyy, h:mm a")
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        <Button size="sm" onClick={() => handleApprove(user)}>
                                            <CheckCircle className="w-4 h-4 mr-2"/>
                                            Approve
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No pending funding requests.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function AnnouncementManager() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const announcementRef = useMemoFirebase(
        () => firestore ? doc(firestore, 'announcement', 'current') : null,
        [firestore]
    );
    const { data: announcement, isLoading } = useDoc<Announcement>(announcementRef);

    const [text, setText] = useState('');
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (announcement) {
            setText(announcement.text);
            setEnabled(announcement.enabled);
        }
    }, [announcement]);

    const handleSave = () => {
        if (!announcementRef) return;
        setDocumentNonBlocking(announcementRef, { text, enabled }, { merge: true });
        toast({ title: 'Success', description: 'Announcement updated.' });
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Broadcast Announcement</CardTitle>
                    <CardDescription>Manage site-wide announcements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-24" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Broadcast Announcement</CardTitle>
                <CardDescription>Manage the site-wide announcement banner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Switch
                        id="announcement-enabled"
                        checked={enabled}
                        onCheckedChange={setEnabled}
                    />
                    <Label htmlFor="announcement-enabled">Enable Announcement Banner</Label>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="announcement-text">Announcement Text</Label>
                    <Textarea
                        id="announcement-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter your announcement here..."
                    />
                </div>
                <Button onClick={handleSave}><Megaphone className="mr-2 h-4 w-4"/> Save Announcement</Button>
            </CardContent>
        </Card>
    );
}

interface Review {
    id: string;
    name: string;
    reviewText: string;
    rating: number;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    } | null;
}

function ReviewManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const reviewsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'reviews'), orderBy('createdAt', 'desc')) : null,
        [firestore]
    );
    const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);


    const handleDelete = async (reviewId: string) => {
        if (!firestore) return;
        if (window.confirm('Are you sure you want to delete this review?')) {
            const reviewRef = doc(firestore, 'reviews', reviewId);
            try {
                await deleteDoc(reviewRef);
                toast({ title: 'Success', description: 'Review deleted successfully.' });
            } catch (error: any) {
                console.error("Error deleting review:", error);
                toast({ 
                    title: 'Error', 
                    description: `Could not delete review: ${error.message}`,
                    variant: 'destructive'
                });
            }
        }
    }

    const formatDateShort = (timestamp: { seconds: number; nanoseconds: number } | null) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp.seconds * 1000);
        return format(date, "MMM d, yyyy");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Review Management</CardTitle>
                <CardDescription>View and delete customer reviews.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Review</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Loading reviews...</TableCell>
                            </TableRow>
                        ) : reviews && reviews.length > 0 ? (
                            reviews.map(review => (
                                <TableRow key={review.id}>
                                    <TableCell className="whitespace-nowrap">{formatDateShort(review.createdAt)}</TableCell>
                                    <TableCell className="whitespace-nowrap">{review.name}</TableCell>
                                    <TableCell className="whitespace-nowrap">{review.rating}/5</TableCell>
                                    <TableCell className="max-w-xs truncate">{review.reviewText}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(review.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No reviews found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function PlanForm({
  plan,
  networkId,
  collectionName,
  onSave,
  isTvPlan = false,
}: {
  plan?: Plan;
  networkId: string;
  collectionName: string;
  onSave: () => void;
  isTvPlan?: boolean;
}) {
  const firestore = useFirestore();
  const [label, setLabel] = useState(plan?.label || '');
  const [price, setPrice] = useState(plan?.price || 0);
  const [validity, setValidity] = useState(plan?.validity || '');
  const { toast } = useToast();

  const handleSave = async () => {
    if (!firestore) return;
    if (!label || price <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill out all fields correctly.',
        variant: 'destructive',
      });
      return;
    }
    const planId = plan?.id || doc(collection(firestore, 'dummy')).id;
    const planRef = doc(firestore, collectionName, networkId, 'plans', planId);
    const data: Omit<Plan, 'id'> = { label, price };
    if (!isTvPlan) {
      data.validity = validity;
    }

    setDocumentNonBlocking(planRef, data, { merge: true });
    toast({ title: 'Success', description: 'Plan saved successfully!' });
    onSave();
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="label" className="text-right">
          Label
        </Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">
          Price (₦)
        </Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="col-span-3"
        />
      </div>
      {!isTvPlan && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="validity" className="text-right">
            Validity
          </Label>
          <Input
            id="validity"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            className="col-span-3"
            placeholder="e.g., 30 Days"
          />
        </div>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={handleSave}>Save Plan</Button>
      </DialogFooter>
    </div>
  );
}

function PlansManager({
  title,
  providers,
  collectionName,
  isTvPlan = false,
}: {
  title: string;
  providers: { id: string; name: string }[];
  collectionName: string;
  isTvPlan?: boolean;
}) {
  const [selectedProvider, setSelectedProvider] = useState(providers[0].id);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>(undefined);
  const firestore = useFirestore();
  const { toast } = useToast();

  const plansQuery = useMemoFirebase(
    () => firestore ? collection(firestore, collectionName, selectedProvider, 'plans') : null,
    [firestore, collectionName, selectedProvider]
  );
  const { data: plans, isLoading } = useCollection<Plan>(plansQuery);


  const handleDelete = async (planId: string) => {
    if (!firestore) return;
    if (window.confirm('Are you sure you want to delete this plan?')) {
      const planRef = doc(firestore, collectionName, selectedProvider, 'plans', planId);
      await deleteDoc(planRef);
      toast({ title: 'Success', description: 'Plan deleted successfully.' });
    }
  };
  
  const openForm = (plan?: Plan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPlan(undefined);
  }

  const colSpan = isTvPlan ? 3 : 4;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Select a provider to view and manage their plans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Select
            value={selectedProvider}
            onValueChange={setSelectedProvider}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
              if (!isOpen) closeForm();
              else setIsFormOpen(true);
          }}>
            <DialogTrigger asChild>
                <Button onClick={() => openForm()} className="w-full md:w-auto">Add New Plan</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingPlan ? 'Edit' : 'Add'} Plan</DialogTitle>
                </DialogHeader>
                <PlanForm
                    plan={editingPlan}
                    networkId={selectedProvider}
                    collectionName={collectionName}
                    onSave={closeForm}
                    isTvPlan={isTvPlan}
                />
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Price</TableHead>
                {!isTvPlan && <TableHead>Validity</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                <TableRow>
                    <TableCell colSpan={colSpan} className="h-24 text-center">
                    Loading...
                    </TableCell>
                </TableRow>
                ) : plans && plans.length > 0 ? (
                plans.map((plan) => (
                    <TableRow key={plan.id}>
                    <TableCell className="whitespace-nowrap">{plan.label}</TableCell>
                    <TableCell className="whitespace-nowrap">₦{plan.price.toLocaleString()}</TableCell>
                    {!isTvPlan && <TableCell className="whitespace-nowrap">{plan.validity}</TableCell>}
                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button variant="outline" size="sm" onClick={() => openForm(plan)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={colSpan} className="h-24 text-center">
                    No plans found for this provider.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}

type NetworkStatusType = 'Online' | 'Degraded' | 'Offline';
interface NetworkStatus {
    id: string;
    name: string;
    status: NetworkStatusType;
}

function NetworkStatusManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const statuses: NetworkStatusType[] = ['Online', 'Degraded', 'Offline'];
    
    const networkStatusQuery = useMemoFirebase(
        () => firestore ? collection(firestore, 'networkStatus') : null,
        [firestore]
    );
    const { data: networkStatuses, isLoading } = useCollection<NetworkStatus>(networkStatusQuery);

    useEffect(() => {
        if (isLoading || !firestore) return;

        const allProviders = [...networkProviders, ...tvProviders];
        const existingIds = networkStatuses?.map(s => s.id) || [];
        
        allProviders.forEach(provider => {
            if (!existingIds.includes(provider.id)) {
                 const newStatus = {
                    id: provider.id,
                    name: provider.name,
                    status: 'Online' as NetworkStatusType,
                    lastChecked: serverTimestamp()
                };
                const statusRef = doc(firestore, 'networkStatus', provider.id);
                setDocumentNonBlocking(statusRef, newStatus, { merge: true });
            }
        });

    }, [networkStatuses, isLoading, firestore]);

    const handleStatusChange = (networkId: string, status: NetworkStatusType) => {
        if (!firestore) return;
        const statusRef = doc(firestore, 'networkStatus', networkId);
        setDocumentNonBlocking(statusRef, { status, lastChecked: serverTimestamp() }, { merge: true });
        toast({ title: 'Success', description: 'Network status updated.' });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
          case 'Online':
            return 'default';
          case 'Degraded':
            return 'secondary';
          case 'Offline':
            return 'destructive';
          default:
            return 'outline';
        }
      };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>
                    Update the operational status of all service providers.
                </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Provider</TableHead>
                            <TableHead>Current Status</TableHead>
                            <TableHead className="text-right">Change Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : networkStatuses && networkStatuses.length > 0 ? (
                            networkStatuses.map(network => (
                                <TableRow key={network.id}>
                                    <TableCell className="font-medium whitespace-nowrap">{network.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(network.status)}>{network.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm"><Pencil className="w-4 h-4 mr-2" /> Edit</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update {network.name} Status</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Select onValueChange={(value) => handleStatusChange(network.id, value as NetworkStatusType)} defaultValue={network.status}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">No network statuses found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
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
      <PlansManager title="TV Subscriptions" providers={tvProviders} collectionName="tvPlans" isTvPlan />
    </div>
  );
}

    