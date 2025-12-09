

'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Image from 'next/image';
import { Calendar, ChevronLeft, Bookmark, Heart, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface Attachment {
    name: string;
    url: string;
}

interface BlogPost {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    createdAt: { seconds: number };
    author: string;
    likes?: string[];
    attachments?: Attachment[];
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
    const isLiked = post?.likes?.includes(user?.uid ?? '') ?? false;
    const likeCount = post?.likes?.length ?? 0;

    const handleInteraction = (type: 'bookmark' | 'like') => {
        if (!user || !userRef || !postRef) {
            router.push('/login');
            return;
        }

        const isAdding = type === 'like' ? !isLiked : !isBookmarked;

        const updateData =
            type === 'like'
                ? { likes: isAdding ? arrayUnion(user.uid) : arrayRemove(user.uid) }
                : { savedPosts: isAdding ? arrayUnion(slug) : arrayRemove(slug) };

        const docToUpdate = type === 'like' ? postRef : userRef;
        updateDocumentNonBlocking(docToUpdate, updateData);

        toast({
            title: isAdding ? `${type.charAt(0).toUpperCase() + type.slice(1)} Added` : `${type.charAt(0).toUpperCase() + type.slice(1)} Removed`,
            description: isAdding
                ? `"${post?.title}" has been added to your ${type === 'like' ? 'liked posts' : 'bookmarks'}.`
                : `"${post?.title}" has been removed.`,
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
                <div className="mb-8">
                    <Button asChild variant="ghost">
                        <Link href="/blog">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Blog
                        </Link>
                    </Button>
                </div>
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 text-gray-900 dark:text-gray-100">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={undefined} alt={post.author} />
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
                
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                </div>

                {post.attachments && post.attachments.length > 0 && (
                    <section className="mt-12">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Downloads</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {post.attachments.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between">
                                            <span className="font-medium">{file.name}</span>
                                            <Button asChild variant="outline" size="sm">
                                                <a href={file.url} download={file.name}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </a>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </section>
                )}

                <div className="mt-12 flex items-center gap-4 border-t pt-6">
                    <Button variant="outline" onClick={() => handleInteraction('like')}>
                        <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-red-500 text-red-500")} />
                        {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                    </Button>
                     <Button variant="outline" onClick={() => handleInteraction('bookmark')}>
                        <Bookmark className={cn("w-4 h-4 mr-2", isBookmarked && "fill-primary text-primary")} />
                        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                </div>
            </article>
        </main>
    );
}
    
