
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    imageUrl: string;
    createdAt: { seconds: number };
    author: string;
}

function PostCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
                <Skeleton className="w-full h-full" />
            </div>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-5/6 mt-2" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-28" />
            </CardFooter>
        </Card>
    )
}

export default function BlogIndexPage() {
    const firestore = useFirestore();
    const postsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'blogPosts'), orderBy('createdAt', 'desc')) : null,
        [firestore]
    );
    const { data: posts, isLoading } = useCollection<BlogPost>(postsQuery);

    const isValidHttpUrl = (string: string) => {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    return (
        <main className="container mx-auto p-4 py-8 md:p-12">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Our Blog</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    News, updates, and insights from the DataConnect team. Stay informed on our latest developments.
                </p>
            </header>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <>
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                    </>
                ) : posts && posts.length > 0 ? (
                    posts.map(post => {
                        const imageUrl = post.imageUrl && isValidHttpUrl(post.imageUrl)
                            ? post.imageUrl
                            : `https://picsum.photos/seed/${post.id}/600/400`;

                        return (
                            <Card key={post.id} className="flex flex-col overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-300">
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
                                        <span>By {post.author}</span>
                                        <span className="mx-2">•</span>
                                        <span>{post.createdAt ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : ''}</span>
                                    </CardDescription>
                                    <CardTitle className="text-xl leading-tight">
                                        <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors stretched-link">{post.title}</Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild variant="link" className="p-0 h-auto font-semibold">
                                        <Link href={`/blog/${post.id}`}>Read More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })
                ) : (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-16">
                        <h2 className="text-2xl font-semibold">No posts yet!</h2>
                        <p className="text-muted-foreground mt-2">Check back soon for updates.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
