
'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
import { Sparkles, Loader2, Image as ImageIcon, Upload, File, X } from 'lucide-react';

const attachmentSchema = z.object({
    name: z.string(),
    url: z.string().url().or(z.string().startsWith("data:")),
});

const FormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    slug: z.string().min(3, "URL Slug must be at least 3 characters long.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
    excerpt: z.string().min(20, "Excerpt must be at least 20 characters.").max(200, "Excerpt cannot exceed 200 characters."),
    imageUrl: z.string().url("Please enter a valid image URL.").or(z.string().startsWith("data:image/")),
    content: z.string().min(50, "Content must be at least 50 characters long."),
    attachments: z.array(attachmentSchema).optional(),
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: '',
            slug: '',
            excerpt: '',
            imageUrl: '',
            content: '',
            attachments: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "attachments",
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
    
    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid File Type",
                description: "Please select an image file (e.g., JPG, PNG, GIF).",
                variant: "destructive"
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            form.setValue('imageUrl', dataUrl, { shouldValidate: true });
            toast({
                title: "Image Uploaded",
                description: "The image has been loaded and is ready to be saved with the post."
            });
        };
        reader.readAsDataURL(file);
    };

    const handleAttachmentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            append({ name: file.name, url: dataUrl });
            toast({
                title: "Attachment Added",
                description: `File "${file.name}" has been attached.`
            });
        };
        reader.readAsDataURL(file);
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
                                    <FormLabel>Cover Image</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input {...field} placeholder="Paste image URL or upload one" />
                                        </FormControl>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                             <Upload className="mr-2 h-4 w-4" />
                                             Upload
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
                        <div className="space-y-4">
                            <FormLabel>Attachments (e.g., PDFs, Docs)</FormLabel>
                            <div className="rounded-lg border bg-background/50 p-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center justify-between gap-4 py-2 border-b last:border-b-0">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <File className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                            <span className="truncate text-sm">{field.name}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="h-7 w-7"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <p className="text-sm text-center text-muted-foreground py-4">No files attached yet.</p>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={attachmentInputRef}
                                onChange={handleAttachmentFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => attachmentInputRef.current?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Add Attachment
                            </Button>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
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
