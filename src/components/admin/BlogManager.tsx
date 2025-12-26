'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit } from 'lucide-react';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

export function BlogManager() {
    const firestore = useFirestore();
    const [editingPost, setEditingPost] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [content, setContent] = useState('');

    const blogQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, "blog"), orderBy("createdAt", "desc"));
    }, [firestore]);

    const { data: posts, isLoading } = useCollection(blogQuery);

    useEffect(() => {
        if (editingPost) {
            setImageUrl(editingPost.imageUrl || null);
            setContent(editingPost.content || '');
        } else {
            setImageUrl(null);
            setContent('');
        }
    }, [editingPost]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = {
            title: formData.get('title') as string,
            slug: formData.get('slug') as string,
            excerpt: formData.get('excerpt') as string,
            content: content, // Use content from state
            author: formData.get('author') as string,
            tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
            status: formData.get('status') as string,
            metaTitle: formData.get('metaTitle') as string,
            metaDescription: formData.get('metaDescription') as string,
            featured: formData.get('featured') === 'on',
            imageUrl: imageUrl, // Use the imageUrl from state
        };

        if (editingPost) {
            await updateBlogPost(editingPost.id, data);
        } else {
            await addBlogPost(data);
        }
        setEditingPost(null);
        setImageUrl(null);
        setContent('');
        e.currentTarget.reset();
    };

    const handleDelete = async (id: string) => {
        await deleteBlogPost(id);
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setImageUrl(null);
        setContent('');
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingPost) {
            const title = e.target.value;
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;
            if (slugInput) {
                slugInput.value = slug;
            }
        }
    };

    const onContentChange = useCallback((value: string) => {
        setContent(value);
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{editingPost ? 'Edit Blog Post' : 'Create Blog Post'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input name="title" placeholder="Title" defaultValue={editingPost?.title || ''} onChange={handleTitleChange} required />
                    <Input name="slug" placeholder="Slug" defaultValue={editingPost?.slug || ''} required />
                    <Textarea name="excerpt" placeholder="Excerpt" defaultValue={editingPost?.excerpt || ''} />
                    <SimpleMDE value={content} onChange={onContentChange} />
                    <Input name="author" placeholder="Author" defaultValue={editingPost?.author || ''} required />
                    <Input name="tags" placeholder="Tags (comma-separated)" defaultValue={editingPost?.tags?.join(', ') || ''} />
                    
                    <Select name="status" defaultValue={editingPost?.status || 'draft'}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input name="metaTitle" placeholder="Meta Title" defaultValue={editingPost?.metaTitle || ''} />
                    <Textarea name="metaDescription" placeholder="Meta Description" defaultValue={editingPost?.metaDescription || ''} />
                    
                    <div>
                        <label>Cover Image</label>
                        <Input type="file" onChange={handleImageChange} />
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
                            <TableHead>Status</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                             <TableRow><TableCell colSpan={5}>Loading posts...</TableCell></TableRow>
                        ) : posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>{post.title}</TableCell>
                                    <TableCell>{post.author}</TableCell>
                                    <TableCell>{post.status}</TableCell>
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
                            <TableRow><TableCell colSpan={5}>No posts yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardFooter>
        </Card>
    );
}
