
'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Image from 'next/image';
import { Calendar, User, ChevronLeft, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


function SimpleMarkdown({ content }: { content: string }) {
    // A simple markdown to HTML converter that handles headings, paragraphs, and lists.
    const htmlContent = content
        .split('\n')
        .filter(line => line.trim() !== '') // Remove empty lines
        .map(line => {
            if (line.startsWith('### ')) return `<h3 class="text-xl font-bold mt-6 mb-2">${line.substring(4)}</h3>`;
            if (line.startsWith('## ')) return `<h2 class="text-2xl font-bold mt-8 mb-3 border-b pb-2">${line.substring(3)}</h2>`;
            if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold mt-10 mb-4 border-b pb-2">${line.substring(2)}</h1>`;
            
            // Handle unordered lists
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return `<li class="mb-2 ml-4">${line.substring(2)}</li>`;
            }
            
            // Handle ordered lists
            const olMatch = line.match(/^(\d+)\.\s(.+)/);
            if (olMatch) {
                return `<li class="mb-2 ml-4">${olMatch[2]}</li>`;
            }
            
            return `<p class="leading-relaxed mb-4 text-lg">${line}</p>`;
        })
        .join('')
        .replace(/<\/li>\s*<li>/g, '</li><li>') // Join list items
        .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>') // Wrap in <ul>
        .replace(/<\/ul>\s*<ul>/g, ''); // Merge adjacent lists

    return <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}


interface BlogPost {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    createdAt: { seconds: number };
    author: string;
}

interface UserProfile {
    savedPosts?: string[];
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
    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast();
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

    const postRef = useMemoFirebase(
        () => (firestore && slug) ? doc(firestore, 'blogPosts', slug) : null,
        [firestore, slug]
    );

    const userRef = useMemoFirebase(
        () => (firestore && user) ? doc(firestore, 'users', user.uid) : null,
        [firestore, user]
    );

    const { data: post, isLoading: isPostLoading } = useDoc<BlogPost>(postRef);
    const { data: userProfile, isLoading: isUserLoading } = useDoc<UserProfile>(userRef);

    const isBookmarked = userProfile?.savedPosts?.includes(slug) ?? false;

    const handleBookmark = () => {
        if (!user || !userRef) {
            router.push('/login');
            return;
        }

        const updateData = {
            savedPosts: isBookmarked ? arrayRemove(slug) : arrayUnion(slug),
        };

        updateDocumentNonBlocking(userRef, updateData);

        toast({
            title: isBookmarked ? 'Bookmark Removed' : 'Post Bookmarked!',
            description: isBookmarked
                ? `"${post?.title}" removed from your saved posts.`
                : `"${post?.title}" has been added to your saved posts.`,
        });
    };

    const isLoading = isPostLoading || isUserLoading;

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
                <div className="flex justify-between items-center mb-8">
                    <Button asChild variant="ghost">
                        <Link href="/blog">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Blog
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={handleBookmark}>
                        <Bookmark className={cn("w-4 h-4 mr-2", isBookmarked && "fill-primary text-primary")} />
                        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                </div>
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

