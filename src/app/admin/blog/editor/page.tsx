
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { generatePostContent, generatePostImage } from '@/ai/flows/generate-post-flow';

const FormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    slug: z.string().min(3, "URL Slug must be at least 3 characters long.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
    excerpt: z.string().min(20, "Excerpt must be at least 20 characters.").max(200, "Excerpt cannot exceed 200 characters."),
    imageUrl: z.string().url("Please enter a valid image URL."),
    content: z.string().min(50, "Content must be at least 50 characters long."),
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
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
    
    const imageUrl = form.watch('imageUrl');

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
    
    const handleGenerateContent = async () => {
        const title = form.getValues('title');
        if (!title) {
            toast({ title: "Title is required", description: "Please enter a title before generating content.", variant: "destructive" });
            return;
        }
        setIsGeneratingContent(true);
        try {
            const result = await generatePostContent({ topic: title });
            form.setValue('excerpt', result.excerpt, { shouldValidate: true });
            form.setValue('content', result.content, { shouldValidate: true });
            toast({ title: "Content Generated!", description: "The excerpt and content fields have been populated." });
        } catch (error) {
            console.error("AI Content Generation Error:", error);
            toast({ title: "Content Generation Failed", description: "Could not generate content. Please try again.", variant: "destructive" });
        } finally {
            setIsGeneratingContent(false);
        }
    };
    
    const handleGenerateImage = async () => {
        const title = form.getValues('title');
        if (!title) {
            toast({ title: "Title is required", description: "Please enter a title before generating an image.", variant: "destructive" });
            return;
        }
        setIsGeneratingImage(true);
        try {
            const result = await generatePostImage({ topic: title });
            form.setValue('imageUrl', result.imageUrl, { shouldValidate: true });
            toast({ title: "Image Generated!", description: "The cover image URL has been populated." });
        } catch (error) {
            console.error("AI Image Generation Error:", error);
            toast({ title: "Image Generation Failed", description: "Could not generate image. Please try again.", variant: "destructive" });
        } finally {
            setIsGeneratingImage(false);
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
            };
            
            if (!slug) {
                // @ts-ignore
                postData.createdAt = serverTimestamp();
            }

            await setDoc(postRef, postData, { merge: true });
            toast({ title: 'Success!', description: `Blog post ${slug ? 'updated' : 'created'}.` });
            router.push('/admin/blog/editor?slug=' + data.slug);
            router.refresh();

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
                         <div className="flex justify-end">
                            <Button type="button" onClick={handleGenerateContent} disabled={isGeneratingContent || isGeneratingImage}>
                                {isGeneratingContent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                {isGeneratingContent ? 'Generating...' : 'Generate Content'}
                            </Button>
                        </div>
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
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <Button type="button" variant="outline" onClick={handleGenerateImage} disabled={isGeneratingImage || isGeneratingContent}>
                                            {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                                            {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         {imageUrl && (
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                                <Image src={imageUrl} alt="Image Preview" fill className="object-cover" />
                            </div>
                         )}
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content (Markdown supported)</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={15} className="min-h-[400px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2">
                             <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                             <Button type="submit" disabled={form.formState.isSubmitting || isGeneratingContent || isGeneratingImage}>
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
