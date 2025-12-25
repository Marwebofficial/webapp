"use client";

import { useState, useMemo, useEffect } from 'react';
import { useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { addBlogPost, deleteBlogPost, updateBlogPost } from "@/firebase/firestore/blog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ImageUploader } from './ImageUploader';

export function BlogManager() {
    const firestore = useFirestore();
    const [editingPost, setEditingPost] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const blogQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, "blog"), orderBy("createdAt", "desc"));
    }, [firestore]);

    const { data: posts, isLoading } = useCollection(blogQuery);

    useEffect(() => {
        if (editingPost && editingPost.imageUrl) {
            setImageUrl(editingPost.imageUrl);
        } else {
            setImageUrl(null);
        }
    }, [editingPost]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = {
            title: formData.get('title') as string,
            content: formData.get('content') as string,
            author: formData.get('author') as string,
            featured: formData.get('featured') === 'on',
        };

        if (imageUrl) {
            data.imageUrl = imageUrl;
        }

        if (editingPost) {
            await updateBlogPost(editingPost.id, data);
        } else {
            await addBlogPost(data);
        }
        setEditingPost(null);
        setImageUrl(null);
        e.currentTarget.reset();
    };

    const handleDelete = async (id: string) => {
        await deleteBlogPost(id);
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setImageUrl(null);
    }

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
                    <div>
                        <label>Cover Image</label>
                        <ImageUploader 
                            onUploadComplete={setImageUrl} 
                            folder="blog-covers" 
                        />
                        {imageUrl && <img src={imageUrl} alt="Cover image preview" className="mt-2 h-32" />}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="featured" name="featured" defaultChecked={editingPost?.featured || false} />
                        <label htmlFor="featured">Featured Post</label>
                    </div>
                    <div className="flex space-x-2">
                        <Button type="submit">{editingPost ? 'Update Post' : 'Create Post'}</Button>
                        {editingPost && <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>}
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
