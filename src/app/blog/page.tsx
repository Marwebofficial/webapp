
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

function FeaturedPostSkeleton() {
     return (
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <div className="space-y-4">
                 <Skeleton className="h-4 w-1/4" />
                 <Skeleton className="h-8 w-full" />
                 <Skeleton className="h-7 w-5/6" />
                 <div className="space-y-2 mt-4">
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-full" />
                 </div>
                 <div className="flex items-center gap-3 pt-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>
        </div>
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
        if (!string) return false;
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    const featuredPost = posts?.[0];
    const otherPosts = posts?.slice(1);

    return (
        <main className="container mx-auto p-4 py-8 md:p-12">
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Our Blog</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                    News, updates, and insights from the DataConnect team. Stay informed on our latest developments.
                </p>
            </header>

             {isLoading && (
                <div className="space-y-16">
                    <FeaturedPostSkeleton />
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                    </div>
                </div>
             )}

            {featuredPost && (
                <section className="mb-16 animate-in fade-in duration-500">
                     <h2 className="text-2xl font-bold tracking-tight mb-6 border-b pb-3">Latest Post</h2>
                     <Card className="grid md:grid-cols-2 gap-0 overflow-hidden shadow-none border-none">
                        <Link href={`/blog/${featuredPost.id}`} className="block relative aspect-video overflow-hidden group">
                           <Image
                                src={isValidHttpUrl(featuredPost.imageUrl) ? featuredPost.imageUrl : `https://picsum.photos/seed/${featuredPost.id}/1200/675`}
                                alt={featuredPost.title}
                                fill
                                className="object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                            />
                        </Link>
                        <div className="p-6 md:pl-8 flex flex-col justify-center">
                             <CardDescription className="mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {featuredPost.createdAt ? format(new Date(featuredPost.createdAt.seconds * 1000), 'MMMM d, yyyy') : ''}
                            </CardDescription>
                            <CardTitle className="text-2xl md:text-3xl leading-tight font-bold mb-4">
                                <Link href={`/blog/${featuredPost.id}`} className="hover:text-primary transition-colors stretched-link">{featuredPost.title}</Link>
                            </CardTitle>
                            <p className="text-muted-foreground line-clamp-3 mb-6">{featuredPost.excerpt}</p>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{featuredPost.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{featuredPost.author}</p>
                                    <p className="text-sm text-muted-foreground">Author</p>
                                </div>
                            </div>
                        </div>
                     </Card>
                </section>
            )}


            {otherPosts && otherPosts.length > 0 && (
                 <section className="animate-in fade-in duration-500 delay-200">
                    <h2 className="text-2xl font-bold tracking-tight mb-6 border-b pb-3">More Posts</h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {otherPosts.map(post => {
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
            
            {!isLoading && posts && posts.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 text-center py-16">
                    <h2 className="text-2xl font-semibold">No posts yet!</h2>
                    <p className="text-muted-foreground mt-2">Check back soon for updates from our team.</p>
                </div>
            )}
        </main>
    );
}
