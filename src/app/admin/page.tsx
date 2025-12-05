
'use client';

import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, doc, deleteDoc, query, serverTimestamp, writeBatch, increment, updateDoc, orderBy, where } from 'firebase/firestore';
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
import { Pencil, Trash2, Megaphone, CheckCircle, WalletCards, PlusCircle } from 'lucide-react';
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
        if (window.confirm('Are you sure you want to delete this blog post?')) {
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
            <CardContent>
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
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell>
                                        {post.createdAt ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
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
    const { toast } = useToast();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading, error } = useCollection<UserProfile>(usersQuery);

    const handleClearBalance = async (userId: string) => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', userId);
        try {
            await updateDoc(userRef, {
                walletBalance: 0
            });
            toast({
                title: "Success!",
                description: "User's wallet balance has been cleared.",
            });
        } catch (error: any) {
            console.error("Clear Balance Error: ", error);
            toast({
                title: "Clear Balance Failed",
                description: `Could not clear balance. Error: ${error.message}`,
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
                <CardDescription>View and manage user wallet balances.</CardDescription>
            </CardHeader>
            <CardContent>
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
                        ) : users && users.length > 0 ? (
                            users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="font-medium">{user.name}</div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>₦{(user.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive">
                                                    <WalletCards className="w-4 h-4 mr-2"/>
                                                    Clear Balance
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action will set {user.name}'s wallet balance to ₦0.00. This cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleClearBalance(user.id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
            </CardContent>
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
            <CardContent>
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
                                    <TableCell>
                                        <div className="font-medium">{user.pendingFundingRequest?.userName || user.name}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </TableCell>
                                    <TableCell>₦{user.pendingFundingRequest?.amount.toLocaleString()}</TableCell>
                                    <TableCell>{user.pendingFundingRequest?.bankName}</TableCell>
                                    <TableCell>
                                        {user.pendingFundingRequest?.createdAt ?
                                            format(new Date(user.pendingFundingRequest.createdAt.seconds * 1000), "MMM d, yyyy, h:mm a")
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
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
            <CardContent>
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
                                    <TableCell>{formatDateShort(review.createdAt)}</TableCell>
                                    <TableCell>{review.name}</TableCell>
                                    <TableCell>{review.rating}/5</TableCell>
                                    <TableCell className="max-w-xs truncate">{review.reviewText}</TableCell>
                                    <TableCell className="text-right">
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
        <div className="flex justify-between items-center">
          <Select
            value={selectedProvider}
            onValueChange={setSelectedProvider}
          >
            <SelectTrigger className="w-[180px]">
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
                <Button onClick={() => openForm()}>Add New Plan</Button>
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
                  <TableCell>{plan.label}</TableCell>
                  <TableCell>₦{plan.price.toLocaleString()}</TableCell>
                  {!isTvPlan && <TableCell>{plan.validity}</TableCell>}
                  <TableCell className="text-right space-x-2">
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
            <CardContent>
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
                                    <TableCell className="font-medium">{network.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(network.status)}>{network.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
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
        router.push('/');
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
      <FundingApprovalManager />
      <UserManagement />
      <BlogManager />
      <AnnouncementManager />
      <NetworkStatusManager />
      <ReviewManager />
      <PlansManager title="Data Plans" providers={networkProviders} collectionName="dataPlans" />
      <PlansManager title="TV Subscriptions" providers={tvProviders} collectionName="tvPlans" isTvPlan />
    </div>
  );
}
