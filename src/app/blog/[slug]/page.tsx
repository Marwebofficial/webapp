
'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// A simple markdown-to-HTML renderer. In a real app, you'd use a more robust library like 'marked' or 'react-markdown'.
function SimpleMarkdown({ content }: { content: string }) {
    const htmlContent = content
        .split('\n')
        .map(line => {
            if (line.startsWith('### ')) return `<h3 class="text-xl font-bold mt-6 mb-2">${line.substring(4)}</h3>`;
            if (line.startsWith('## ')) return `<h2 class="text-2xl font-bold mt-8 mb-3 border-b pb-2">${line.substring(3)}</h2>`;
            if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold mt-10 mb-4 border-b pb-2">${line.substring(2)}</h1>`;
            if (line.trim() === '') return '<br />';
            return `<p class="leading-relaxed mb-4">${line}</p>`;
        })
        .join('');

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

interface BlogPost {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    createdAt: { seconds: number };
    author: string;
}

function PostSkeleton() {
    return (
        <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <div className="flex items-center gap-6 mb-8 text-sm text-muted-foreground">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="w-full aspect-video rounded-lg mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <br/>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
            </div>
        </div>
    )
}

export default function BlogPostPage() {
    const firestore = useFirestore();
    const params = useParams();
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

    const postRef = useMemoFirebase(
        () => (firestore && slug) ? doc(firestore, 'blogPosts', slug) : null,
        [firestore, slug]
    );

    const { data: post, isLoading } = useDoc<BlogPost>(postRef);

    if (isLoading) {
        return (
             <main className="container mx-auto p-4 py-8 md:p-12">
                <PostSkeleton />
             </main>
        );
    }

    if (!post) {
        return (
            <main className="container mx-auto p-4 py-8 md:p-12 text-center">
                 <h1 className="text-4xl font-bold">Post Not Found</h1>
                 <p className="text-muted-foreground mt-4">The blog post you're looking for doesn't exist.</p>
                 <Button asChild className="mt-8">
                    <Link href="/blog">Back to Blog</Link>
                 </Button>
            </main>
        );
    }

    return (
        <main className="container mx-auto p-4 py-8 md:p-12">
            <article className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>By {post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Calendar className="w-4 h-4" />
                            <time dateTime={new Date(post.createdAt.seconds * 1000).toISOString()}>
                                {format(new Date(post.createdAt.seconds * 1000), 'MMMM d, yyyy')}
                            </time>
                        </div>
                    </div>
                </header>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-8">
                    <Image
                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/1200/675`}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                   <SimpleMarkdown content={post.content} />
                </div>
            </article>
        </main>
    );
}

    