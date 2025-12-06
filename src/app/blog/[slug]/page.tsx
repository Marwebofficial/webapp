
'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser, updateDocumentNonBlocking, useCollection, addDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion, arrayRemove, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Calendar, ChevronLeft, Bookmark, Heart, Send } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment is too long."),
});

type CommentFormData = z.infer<typeof commentSchema>;

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
    likes?: string[];
}

interface UserProfile {
    savedPosts?: string[];
}

interface Comment {
    id: string;
    authorName: string;
    authorImage: string | null;
    text: string;
    createdAt: { seconds: number; nanoseconds: number; };
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

function CommentSectionSkeleton() {
    return (
        <div className="space-y-6 mt-12">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-20 w-full rounded-md" />
            </div>
            <div className="space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </div>
        </div>
    );
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

    const commentsQuery = useMemoFirebase(
        () => postRef ? query(collection(postRef, 'comments'), orderBy('createdAt', 'desc')) : null,
        [postRef]
    );

    const { data: post, isLoading: isPostLoading } = useDoc<BlogPost>(postRef);
    const { data: userProfile, isLoading: isUserLoading } = useDoc<UserProfile>(userRef);
    const { data: comments, isLoading: areCommentsLoading } = useCollection<Comment>(commentsQuery);

    const isBookmarked = userProfile?.savedPosts?.includes(slug) ?? false;
    const isLiked = post?.likes?.includes(user?.uid ?? '') ?? false;
    const likeCount = post?.likes?.length ?? 0;

    const commentForm = useForm<CommentFormData>({
        resolver: zodResolver(commentSchema),
        defaultValues: { text: '' },
    });

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

    const handleCommentSubmit = (data: CommentFormData) => {
        if (!user || !commentsQuery) return;
        const commentsColRef = collection(postRef!, 'comments');
        addDocumentNonBlocking(commentsColRef, {
            userId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorImage: user.photoURL || null,
            text: data.text,
            createdAt: serverTimestamp(),
        });
        commentForm.reset();
        toast({ title: "Comment posted!" });
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
                
                <SimpleMarkdown content={post.content} />

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

            <section className="max-w-4xl mx-auto mt-16">
                <h2 className="text-2xl font-bold mb-6">Comments ({comments?.length ?? 0})</h2>

                {areCommentsLoading && <CommentSectionSkeleton />}
                
                {!areCommentsLoading && (
                    <>
                        <Card className="mb-8">
                            <CardContent className="p-6">
                                <Form {...commentForm}>
                                    <form onSubmit={commentForm.handleSubmit(handleCommentSubmit)} className="flex items-start gap-4">
                                        <Avatar className="hidden sm:block">
                                            <AvatarImage src={user?.photoURL || undefined} />
                                            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow space-y-2">
                                            <FormField
                                                control={commentForm.control}
                                                name="text"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Write a comment..."
                                                                {...field}
                                                                rows={3}
                                                                disabled={!user}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex justify-end">
                                                <Button type="submit" disabled={!user || commentForm.formState.isSubmitting}>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Post Comment
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                                {!user && <p className="text-sm text-center text-muted-foreground mt-4">Please <Link href="/login" className="underline text-primary">log in</Link> to post a comment.</p>}
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            {comments && comments.length > 0 ? comments.map(comment => (
                                <div key={comment.id} className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src={comment.authorImage || undefined} />
                                        <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow rounded-lg bg-secondary p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-semibold">{comment.authorName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true }) : ''}
                                            </p>
                                        </div>
                                        <p className="text-sm">{comment.text}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to share your thoughts!</p>
                            )}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

    