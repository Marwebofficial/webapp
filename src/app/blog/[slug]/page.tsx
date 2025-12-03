
'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Image from 'next/image';
import { Calendar, User, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


function SimpleMarkdown({ content }: { content: string }) {
    const htmlContent = content
        .split('\n')
        .filter(line => line.trim() !== '') // Remove empty lines
        .map(line => {
            if (line.startsWith('### ')) return `<h3 class="text-xl font-bold mt-6 mb-2">${line.substring(4)}</h3>`;
            if (line.startsWith('## ')) return `<h2 class="text-2xl font-bold mt-8 mb-3 border-b pb-2">${line.substring(3)}</h2>`;
            if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold mt-10 mb-4 border-b pb-2">${line.substring(2)}</h1>`;
             if (line.startsWith('- ')) return `<li class="mb-2">${line.substring(2)}</li>`
            // Basic check for list items
            if (/^\d+\.\s/.test(line)) return `<li class="mb-2">${line.substring(line.indexOf(' ') + 1)}</li>`;
            
            return `<p class="leading-relaxed mb-4 text-lg">${line}</p>`;
        })
        .join('');

    // Wrap lists
    const withLists = htmlContent
        .replace(/<li>/g, '<ul><li>')
        .replace(/<\/li>\s*<li>/g, '</li><li>')
        .replace(/<\/li>(?!<li>)/g, '</li></ul>');

    return <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: withLists }} />;
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
            <div className="space-y-4 mt-8">
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
        <main className="container mx-auto p-4 py-8 md:py-12">
            <article className="max-w-4xl mx-auto">
                <Button asChild variant="ghost" className="mb-8">
                     <Link href="/blog">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>
                </Button>
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 text-gray-900 dark:text-gray-100">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                            </Avatar>
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
                <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-12 shadow-lg">
                    <Image
                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/1200/675`}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <SimpleMarkdown content={post.content} />
            </article>
        </main>
    );
}
