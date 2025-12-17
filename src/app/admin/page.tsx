
"use client";

import { useState, useMemo } from 'react';
import { db } from "@/firebase/firebase-config";
import { collection, query, orderBy, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCollection } from "@/firebase/firestore/use-collection";
import { addUser, deleteUser, updateUser } from "@/firebase/firestore/users";
import { addBlogPost, deleteBlogPost, updateBlogPost } from "@/firebase/firestore/blog";
import { addAnnouncement, deleteAnnouncement, updateAnnouncement } from "@/firebase/firestore/announcements";
import { addNetworkStatus, deleteNetworkStatus, updateNetworkStatus } from "@/firebase/firestore/network-status";
import { addPlan, deletePlan, updatePlan } from "@/firebase/firestore/plans";
import { deleteReview } from "@/firebase/firestore/reviews";
import { updateFundingRequest } from "@/firebase/firestore/funding";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { networkProviders, tvProviders } from "@/lib/providers";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, PlusCircle } from 'lucide-react';

// Reusable hook for memoizing Firestore queries
const useMemoizedQuery = (collectionName, ordering) => {
    return useMemo(() => query(collection(db, collectionName), orderBy(ordering, "desc")), [collectionName, ordering]);
};

// User Management Component
function UserManagement() {
    const [search, setSearch] = useState('');
    const usersQuery = useMemoizedQuery("users", "name");
    const { data: users, isLoading } = useCollection(usersQuery);

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(user =>
            (user.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(search.toLowerCase())
        );
    }, [users, search]);

    const handleDelete = async (id) => {
        await deleteUser(id);
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4}>Loading users...</TableCell></TableRow>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name || 'N/A'}</TableCell>
                                    <TableCell>{user.email || 'N/A'}</TableCell>
                                    <TableCell>{user.role || 'user'}</TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={4}>No users found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


// Funding Approval Manager
function FundingApprovalManager() {
    const fundingQuery = useMemo(() =>
        query(collection(db, "funding"), where("status", "==", "pending"))
    , []);
    const { data: fundingRequests, isLoading } = useCollection(fundingQuery);

    const handleApproval = async (id, approve) => {
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

// Blog Manager Component
function BlogManager() {
    const blogQuery = useMemoizedQuery("blog", "createdAt");
    const { data: posts, isLoading } = useCollection(blogQuery);
    const [editingPost, setEditingPost] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            content: formData.get('content'),
            author: formData.get('author'),
            featured: formData.get('featured') === 'on',
        };

        if (editingPost) {
            await updateBlogPost(editingPost.id, data);
        } else {
            await addBlogPost(data);
        }
        setEditingPost(null);
        e.target.reset();
    };

    const handleDelete = async (id) => {
        await deleteBlogPost(id);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{editingPost ? 'Edit Blog Post' : 'Create Blog Post'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input name="title" placeholder="Title" defaultValue={editingPost?.title || ''} required />
                    <Textarea name="content" placeholder="Content (Markdown supported)" defaultValue={editingPost?.content || ''} required />
                    <Input name="author" placeholder="Author" defaultValue={editingPost?.author || ''} required />
                    <div className="flex items-center space-x-2">
                        <Checkbox id="featured" name="featured" defaultChecked={editingPost?.featured || false} />
                        <label htmlFor="featured">Featured Post</label>
                    </div>
                    <div className="flex space-x-2">
                        <Button type="submit">{editingPost ? 'Update Post' : 'Create Post'}</Button>
                        {editingPost && <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>}
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                             <TableRow><TableCell colSpan={4}>Loading posts...</TableCell></TableRow>
                        ) : posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>{post.title}</TableCell>
                                    <TableCell>{post.author}</TableCell>
                                    <TableCell>{post.featured ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditingPost(post)}><Edit className="h-4 w-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the blog post.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(post.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={4}>No posts yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardFooter>
        </Card>
    );
}


// Announcement Manager Component
function AnnouncementManager() {
    const announcementQuery = useMemoizedQuery("announcements", "createdAt");
    const { data: announcements, isLoading } = useCollection(announcementQuery);
    const [editing, setEditing] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { message: e.target.message.value };
        if (editing) {
            await updateAnnouncement(editing.id, data);
        } else {
            await addAnnouncement(data);
        }
        setEditing(null);
        e.target.reset();
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
                        ) : announcements?.map(ann => (
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

// Network Status Manager
function NetworkStatusManager() {
    const statusQuery = useMemoizedQuery("networkStatus", "createdAt");
    const { data: statuses, isLoading } = useCollection(statusQuery);
    const [editing, setEditing] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { message: e.target.message.value, status: e.target.status.value };
        if (editing) {
            await updateNetworkStatus(editing.id, data);
        } else {
            await addNetworkStatus(data);
        }
        setEditing(null);
        e.target.reset();
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
                        ) : statuses?.map(s => (
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


// Review Manager Component
function ReviewManager() {
    const reviewsQuery = useMemoizedQuery("reviews", "createdAt");
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
                            reviews.map(review => (
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

// Plans Manager Component
function PlansManager({ title, providers, collectionName, isTvPlan = false }) {
    const plansQuery = useMemo(() => query(collection(db, collectionName), orderBy("price")), [collectionName]);
    const { data: plans, isLoading } = useCollection(plansQuery);
    const [editing, setEditing] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            price: Number(formData.get('price')),
            provider: formData.get('provider'),
            ...(isTvPlan ? { channels: formData.get('channels') } : { speed: formData.get('speed') })
        };

        if (editing) {
            await updatePlan(collectionName, editing.id, data);
        } else {
            await addPlan(collectionName, data);
        }
        setEditing(null);
        e.target.reset();
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
                            plans.map(plan => (
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

export default function AdminPage() {
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
