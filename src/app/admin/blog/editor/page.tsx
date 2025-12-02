
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useUser, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const FormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    slug: z.string().min(3, "URL Slug must be at least 3 characters long.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
    excerpt: z.string().min(20, "Excerpt must be at least 20 characters.").max(200, "Excerpt cannot exceed 200 characters."),
    imageUrl: z.string().url("Please enter a valid image URL."),
    content: z.string().min(100, "Content must be at least 100 characters long."),
});

type FormData = z.infer<typeof FormSchema>;

function BlogPostEditor() {
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(!!slug);

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: '',
            slug: '',
            excerpt: '',
            imageUrl: '',
            content: '',
        },
    });

    useEffect(() => {
        if (slug && firestore) {
            const fetchPost = async () => {
                const postRef = doc(firestore, 'blogPosts', slug);
                const postSnap = await getDoc(postRef);
                if (postSnap.exists()) {
                    const postData = postSnap.data() as FormData;
                    form.reset(postData);
                } else {
                    toast({ title: "Error", description: "Post not found.", variant: "destructive" });
                    router.push('/admin');
                }
                setIsLoading(false);
            };
            fetchPost();
        }
    }, [slug, firestore, form, router, toast]);

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue('title', e.target.value);
        if (!slug) { // Only auto-slugify for new posts
            form.setValue('slug', slugify(e.target.value), { shouldValidate: true });
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!firestore || !user) return;

        const postRef = doc(firestore, 'blogPosts', data.slug);

        try {
            const postData = {
                ...data,
                author: user.displayName || 'Admin',
                updatedAt: serverTimestamp(),
                createdAt: slug ? undefined : serverTimestamp(), // Only set createdAt for new posts
            };
            if (!slug) {
                postData.createdAt = serverTimestamp();
            }

            await setDoc(postRef, postData, { merge: true });
            toast({ title: 'Success!', description: `Blog post ${slug ? 'updated' : 'created'}.` });
            router.push('/admin');
        } catch (error: any) {
            console.error("Error saving post:", error);
            toast({ title: "Save Failed", description: error.message, variant: "destructive" });
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>{slug ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
                <CardDescription>Fill out the details below. Content can be written in Markdown.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} onChange={handleTitleChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL Slug</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={!!slug} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="excerpt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Excerpt (Summary)</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={3} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cover Image URL</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content (Markdown supported)</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={15} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2">
                             <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                             <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Saving...' : 'Save Post'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


export default function BlogEditorPage() {
    return (
        <main className="container mx-auto p-4 py-8 md:p-12">
            <Suspense fallback={<div>Loading editor...</div>}>
                <BlogPostEditor />
            </Suspense>
        </main>
    );
}


    