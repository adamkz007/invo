import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/_next/', '/admin/'],
    },
    sitemap: 'https://invo.my/sitemap.xml',
  };
}