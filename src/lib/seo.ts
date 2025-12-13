import type { Metadata } from 'next';
import { BLOG_POSTS, getBlogPostBySlug, getBlogPostUrl } from './blog-posts';

const siteName = 'Invo';
const siteUrl = 'https://invo.my';
const defaultOgImage = '/dashboard-preview.png';

export function getBlogListingMetadata(): Metadata {
  const description =
    'Read practical invoicing, compliance, and operations tips for Malaysian SMEs from the Invo team.';

  return {
    title: 'Invo Blog',
    description,
    alternates: {
      canonical: `${siteUrl}/blog`,
    },
    openGraph: {
      type: 'website',
      url: `${siteUrl}/blog`,
      title: 'Invo Blog',
      description,
      siteName,
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: 'Invo blog hero',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Invo Blog',
      description,
      images: [defaultOgImage],
    },
  };
}

export function getBlogPostMetadata(slug: string): Metadata {
  const post = getBlogPostBySlug(slug);
  const title = post ? `${post.title} | Invo Blog` : 'Invo Blog';
  const description =
    post?.excerpt ||
    'Insights, tips, and resources to help Malaysian SMEs manage invoicing, compliance, and finances.';
  const url = getBlogPostUrl(slug);
  const image = post?.image || defaultOgImage;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post?.imageAlt || post?.title || 'Invo blog article',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export const blogSitemapEntries = BLOG_POSTS.map((post) => ({
  url: getBlogPostUrl(post.slug),
  lastModified: new Date(post.updatedAt),
  changeFrequency: 'weekly' as const,
  priority: 0.7,
}));




