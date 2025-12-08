import type { Metadata } from 'next';
import BlogPageClient from './blog-page-client';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { getBlogListingMetadata } from '@/lib/seo';

export const metadata: Metadata = getBlogListingMetadata();

export default function BlogPage() {
  return <BlogPageClient posts={BLOG_POSTS} />;
}