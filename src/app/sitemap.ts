import { MetadataRoute } from 'next';

// This would typically fetch from your CMS or database
async function getAllBlogPosts() {
  // For now, return static blog posts based on existing structure
  return [
    {
      slug: 'tax-deductions-business-expenses',
      updatedAt: '2024-12-01T00:00:00.000Z'
    },
    {
      slug: 'malaysia-e-invoicing-changes',
      updatedAt: '2024-11-28T00:00:00.000Z'
    },
    {
      slug: 'invoice-tips-small-business',
      updatedAt: '2024-11-28T00:00:00.000Z'
    },
    {
      slug: 'digital-transformation-smes',
      updatedAt: '2024-11-28T00:00:00.000Z'
    }
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://invo.my';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];
  
  // Dynamic blog posts
  const posts = await getAllBlogPosts();
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  return [...staticPages, ...blogPages];
}