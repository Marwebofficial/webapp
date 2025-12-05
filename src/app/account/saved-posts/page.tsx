
'use client';

import { useFirestore, useDoc, useMemoFirebase, useCollection, useUser } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    imageUrl: string;
    createdAt: { seconds: number };
    author: string;
}

interface UserProfile {
    savedPosts?: string[];
}

function PostCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
                <Skeleton className="w-full h-full" />
            </div>
            <CardHeader>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-full mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </CardContent>
            <CardFooter>
                 <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}


export default function SavedPostsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const userDocRef = useMemoFirebase(
        () => (user ? collection(firestore, 'users').doc(user.uid) : null),
        [user, firestore]
    );

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    const savedPostsQuery = useMemoFirebase(() => {
        if (!firestore || !userProfile || !userProfile.savedPosts || userProfile.savedPosts.length === 0) {
            return null;
        }
        return query(
            collection(firestore, 'blogPosts'),
            where(documentId(), 'in', userProfile.savedPosts)
        );
    }, [firestore, userProfile]);

    const { data: posts, isLoading: arePostsLoading } = useCollection<BlogPost>(savedPostsQuery);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const isValidHttpUrl = (string: string) => {
        if (!string) return false;
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'data:';
        } catch (_) {
            return false;
        }
    }
    
    const isLoading = isUserLoading || isProfileLoading || arePostsLoading;

    return (
        <main className="container mx-auto p-4 py-8 md:p-12">
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Saved Posts</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                    Your collection of bookmarked articles. Revisit your favorite reads anytime.
                </p>
            </header>

            {isLoading && (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <PostCardSkeleton />
                    <PostCardSkeleton />
                    <PostCardSkeleton />
                </div>
            )}
            
            {!isLoading && posts && posts.length > 0 && (
                 <section className="animate-in fade-in duration-500">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map(post => {
                            const imageUrl = isValidHttpUrl(post.imageUrl)
                                ? post.imageUrl
                                : `https://picsum.photos/seed/${post.id}/600/400`;

                            return (
                                <Card key={post.id} className="flex flex-col overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300 border rounded-xl">
                                    <Link href={`/blog/${post.id}`} className="block aspect-video relative overflow-hidden">
                                        <Image
                                            src={imageUrl}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </Link>
                                    <CardHeader>
                                        <CardDescription>
                                            {post.createdAt ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : ''}
                                        </CardDescription>
                                        <CardTitle className="text-xl leading-tight">
                                            <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors stretched-link">{post.title}</Link>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                                    </CardContent>
                                    <CardFooter>
                                         <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold">{post.author}</p>
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                </section>
            )}
            
            {!isLoading && (!posts || posts.length === 0) && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-6 text-xl font-semibold">No Saved Posts Yet</h2>
                    <p className="mt-2 text-muted-foreground">You haven't bookmarked any articles. Start exploring our blog!</p>
                    <Button asChild className="mt-6">
                        <Link href="/blog">Explore Blog</Link>
                    </Button>
                </div>
            )}
        </main>
    );
}
