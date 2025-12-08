import type { BlogPost } from '@/types';

const siteUrl = 'https://invo.my';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'export-import-opportunities-malaysian-smes',
    title: 'Export & Import Opportunities for Malaysian SMEs: Your Gateway to Global Markets',
    excerpt: 'Learn about Malaysia\'s strategic advantages, high-potential export products, and step-by-step guidance to help your business expand into international markets.',
    category: 'International Trade',
    date: 'June 12, 2023',
    publishedAt: '2023-06-12T00:00:00.000Z',
    updatedAt: '2023-06-12T00:00:00.000Z',
    author: 'Adam',
    readTime: '12 min read',
    image: '/blog/export-import.jpg',
    imageAlt: 'Export & Import Opportunities for Malaysian SMEs',
    featured: true,
    tags: ['export', 'import', 'SME', 'Malaysia', 'trade'],
  },
  {
    slug: 'malaysian-government-grants-sme',
    title: 'Complete Guide to Malaysian Government Grants for SMEs in 2025',
    excerpt: 'Discover the major government grants available to Malaysian SMEs in 2025, with details on eligibility requirements and application processes.',
    category: 'Financing',
    date: 'February 28, 2025',
    publishedAt: '2025-02-28T00:00:00.000Z',
    updatedAt: '2025-02-28T00:00:00.000Z',
    author: 'Adam',
    readTime: '12 min read',
    image: '/blog/government-grants.jpg',
    imageAlt: 'Malaysian Government Grants for SMEs',
    featured: false,
    tags: ['SME grants', 'financing', 'Malaysia', 'funding'],
  },
  {
    slug: 'inventory-management-retail',
    title: 'Smart Inventory Management for Malaysian Retail Businesses',
    excerpt: 'Learn how effective inventory management can reduce costs and improve customer satisfaction for Malaysian retailers.',
    category: 'Inventory Management',
    date: 'April 10, 2023',
    publishedAt: '2023-04-10T00:00:00.000Z',
    updatedAt: '2023-04-10T00:00:00.000Z',
    author: 'Adam',
    readTime: '8 min read',
    image: '/blog/inventory-management.jpg',
    imageAlt: 'Inventory Management for Malaysian Retail',
    featured: false,
    tags: ['inventory', 'retail', 'Malaysia', 'stock control'],
  },
  {
    slug: 'invoice-tips-small-business',
    title: 'Essential Invoicing Tips for Small Business Success',
    excerpt: 'Discover how proper invoicing can improve your cash flow and enhance your professional image with customers.',
    category: 'Invoicing',
    date: 'February 28, 2023',
    publishedAt: '2023-02-28T00:00:00.000Z',
    updatedAt: '2023-02-28T00:00:00.000Z',
    author: 'Adam',
    readTime: '7 min read',
    image: '/blog/invoice-tips.jpg',
    imageAlt: 'Essential Invoicing Tips',
    featured: false,
    tags: ['invoicing', 'cash flow', 'small business'],
  },
  {
    slug: 'malaysia-e-invoicing-changes',
    title: 'Malaysia E-Invoicing: New Changes and How They Impact SMEs',
    excerpt: 'Learn about the latest e-invoicing regulations in Malaysia and what your small business needs to do to stay compliant.',
    category: 'Compliance',
    date: 'March 15, 2025',
    publishedAt: '2025-03-15T00:00:00.000Z',
    updatedAt: '2025-03-15T00:00:00.000Z',
    author: 'Adam',
    readTime: '6 min read',
    image: '/blog/malaysia-e-invoicing.jpg',
    imageAlt: 'Malaysia E-Invoicing Changes',
    featured: false,
    tags: ['e-invoicing', 'compliance', 'Malaysia', 'SME'],
  },
  {
    slug: 'digital-transformation-smes',
    title: 'Digital Transformation for SMEs: Where to Start',
    excerpt: 'A practical guide to beginning your digital transformation journey without overwhelming your resources or team.',
    category: 'Digital Transformation',
    date: 'February 28, 2025',
    publishedAt: '2025-02-28T00:00:00.000Z',
    updatedAt: '2025-02-28T00:00:00.000Z',
    author: 'Adam',
    readTime: '5 min read',
    image: '/blog/digital-transformation.jpg',
    imageAlt: 'Digital Transformation for SMEs',
    featured: false,
    tags: ['digital transformation', 'SME', 'technology'],
  },
  {
    slug: 'tax-deductions-business-expenses',
    title: 'Tax Deductions: Business Expenses You Might Be Missing',
    excerpt: 'Discover often-missed tax deductions for Malaysian businesses and how to claim them correctly.',
    category: 'Taxes',
    date: 'January 30, 2023',
    publishedAt: '2023-01-30T00:00:00.000Z',
    updatedAt: '2023-01-30T00:00:00.000Z',
    author: 'Adam',
    readTime: '7 min read',
    image: '/blog/tax-deductions.jpg',
    imageAlt: 'Tax Deductions for Business Expenses',
    featured: false,
    tags: ['tax deductions', 'business expenses', 'Malaysia', 'tax'],
  },
];

export const FEATURED_BLOG_POST = BLOG_POSTS.find((post) => post.featured);

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostUrl(slug: string) {
  return `${siteUrl}/blog/posts/${slug}`;
}

