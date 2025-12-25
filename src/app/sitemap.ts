
import { getBlogPosts } from '@/firebase/firestore/blog';
import { MetadataRoute } from 'next'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const blogPosts = await getBlogPosts();

  const posts = blogPosts.docs.map((doc) => ({
    url: `https://dataconnect.vercel.app/blog/${doc.data().slug}`,
    lastModified: doc.data().updatedAt.toDate(),
  }));

  return [
    {
      url: 'https://dataconnect.vercel.app',
      lastModified: new Date(),
    },
    {
      url: 'https://dataconnect.vercel.app/buy-data',
      lastModified: new Date(),
    },
    {
        url: 'https://dataconnect.vercel.app/buy-airtime',
        lastModified: new Date(),
    },
    {
        url: 'https://dataconnect.vercel.app/airtime-to-cash',
        lastModified: new Date(),
    },
    {
        url: 'https://dataconnect.vercel.app/blog',
        lastModified: new Date(),
    },
    ...posts,
  ]
}