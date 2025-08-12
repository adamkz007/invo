# SEO Optimization & Blog Formatting Standards

## Overview

This document outlines comprehensive SEO optimization strategies and blog formatting standards for the Invo website. It includes modern SEO best practices for Next.js applications and standardized formatting guidelines based on the existing article structure.

## 1. SEO Optimization Strategy

### 1.1 Meta Tags & Metadata

#### Enhanced Root Layout Metadata
```typescript
// src/app/layout.tsx - Enhanced metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://invo.my'),
  title: {
    default: 'Invo - Smart Invoicing for Malaysian SMEs',
    template: '%s | Invo'
  },
  description: 'Practical invoicing solution designed for small and medium enterprises in Malaysia. Streamline your billing, track expenses, and manage finances with ease.',
  keywords: ['invoicing', 'SME', 'Malaysia', 'billing', 'finance', 'business', 'accounting', 'receipts'],
  authors: [{ name: 'Invo Team' }],
  creator: 'Invo',
  publisher: 'Invo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://invo.my',
    siteName: 'Invo',
    title: 'Invo - Smart Invoicing for Malaysian SMEs',
    description: 'Practical invoicing solution designed for small and medium enterprises in Malaysia.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Invo - Smart Invoicing Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invo - Smart Invoicing for Malaysian SMEs',
    description: 'Practical invoicing solution designed for small and medium enterprises in Malaysia.',
    images: ['/twitter-image.jpg'],
    creator: '@invo_my',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://invo.my',
    languages: {
      'en-MY': 'https://invo.my',
      'ms-MY': 'https://invo.my/ms',
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/maskable-icon.png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Invo',
  },
  applicationName: 'Invo',
};
```

#### Blog Post Metadata Template
```typescript
// For individual blog posts
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `https://invo.my/blog/posts/${params.slug}`,
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
    alternates: {
      canonical: `https://invo.my/blog/posts/${params.slug}`,
    },
  };
}
```

### 1.2 Structured Data (JSON-LD)

#### Organization Schema
```typescript
// src/components/seo/structured-data.tsx
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Invo",
  "url": "https://invo.my",
  "logo": "https://invo.my/invo-logo.png",
  "description": "Practical invoicing solution designed for small and medium enterprises in Malaysia",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "MY",
    "addressRegion": "Kuala Lumpur"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+60-xxx-xxx-xxxx",
    "contactType": "customer service",
    "availableLanguage": ["English", "Malay"]
  },
  "sameAs": [
    "https://www.facebook.com/invo.my",
    "https://www.linkedin.com/company/invo-my",
    "https://twitter.com/invo_my"
  ]
};
```

#### Article Schema for Blog Posts
```typescript
const articleSchema = (post: BlogPost) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "description": post.excerpt,
  "image": post.featuredImage,
  "author": {
    "@type": "Person",
    "name": post.author.name,
    "jobTitle": post.author.title,
    "description": post.author.bio
  },
  "publisher": {
    "@type": "Organization",
    "name": "Invo",
    "logo": {
      "@type": "ImageObject",
      "url": "https://invo.my/invo-logo.png"
    }
  },
  "datePublished": post.publishedAt,
  "dateModified": post.updatedAt,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://invo.my/blog/posts/${post.slug}`
  },
  "articleSection": post.category,
  "keywords": post.tags.join(", "),
  "wordCount": post.wordCount,
  "timeRequired": `PT${post.readTime}M`
});
```

#### Breadcrumb Schema
```typescript
const breadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});
```

### 1.3 Sitemap Generation

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

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
```

### 1.4 Robots.txt

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/_next/'],
    },
    sitemap: 'https://invo.my/sitemap.xml',
  };
}
```

### 1.5 Performance Optimizations

#### Image Optimization
```typescript
// Enhanced Next.js config for images
const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};
```

#### Font Optimization
```typescript
// src/app/layout.tsx - Optimized font loading
import { DM_Serif_Text, Open_Sans } from "next/font/google";

const dmSerifText = DM_Serif_Text({
  variable: "--font-dm-serif",
  weight: ["400"],
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});
```

### 1.6 Core Web Vitals Optimization

#### Loading Performance
- Implement lazy loading for images and components
- Use Next.js dynamic imports for heavy components
- Optimize bundle splitting
- Implement service worker for caching

#### Interactivity
- Minimize JavaScript execution time
- Use React.memo for expensive components
- Implement proper loading states
- Optimize event handlers

#### Visual Stability
- Define explicit dimensions for images
- Use CSS aspect-ratio for responsive images
- Implement skeleton loading states
- Avoid layout shifts in dynamic content

## 2. Blog Formatting Standards

### 2.1 Typography Hierarchy

Based on the existing article structure, the following typography standards should be applied:

#### Headings
```css
/* H1 - Article Title (in header section) */
.article-title {
  font-size: clamp(1.875rem, 4vw, 3rem); /* 30px - 48px */
  font-weight: 700;
  line-height: 1.1;
  color: white; /* In header context */
  margin-bottom: 1.5rem;
}

/* H2 - Main Section Headings */
.prose h2 {
  font-size: clamp(1.5rem, 3vw, 2rem); /* 24px - 32px */
  font-weight: 700;
  line-height: 1.2;
  color: var(--primary);
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

/* H3 - Subsection Headings */
.prose h3 {
  font-size: clamp(1.25rem, 2.5vw, 1.5rem); /* 20px - 24px */
  font-weight: 700;
  line-height: 1.3;
  color: var(--primary);
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

/* H4 - Minor Headings */
.prose h4 {
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  line-height: 1.4;
  color: var(--foreground);
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
```

#### Body Text
```css
/* Paragraph Text */
.prose p {
  font-size: 1rem; /* 16px */
  line-height: 1.7;
  color: var(--foreground);
  margin-bottom: 1.25rem;
}

/* Lead Paragraph (first paragraph after H2) */
.prose h2 + p {
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Emphasis Text */
.prose strong {
  font-weight: 700;
  color: var(--primary);
}

/* Links */
.prose a {
  color: var(--primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.prose a:hover {
  border-bottom-color: var(--primary);
}
```

### 2.2 Spacing Standards

#### Vertical Rhythm
```css
/* Article Container */
.article-content {
  max-width: 48rem; /* 768px */
  margin: 0 auto;
  padding: 3rem 1rem;
}

/* Section Spacing */
.prose > * + * {
  margin-top: 1.25rem;
}

.prose h2 {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

.prose h3 {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

/* List Spacing */
.prose ul, .prose ol {
  margin: 1.5rem 0;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose li:last-child {
  margin-bottom: 0;
}
```

#### Component Spacing
```css
/* Callout Boxes */
.callout-box {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

/* Image Figures */
.prose figure {
  margin: 2rem 0;
}

.prose figcaption {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  text-align: center;
  font-style: italic;
}

/* Code Blocks */
.prose pre {
  margin: 1.5rem 0;
  padding: 1.5rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
```

### 2.3 Component Standards

#### Callout Boxes
```typescript
// Warning/Disclaimer Box
const DisclaimerBox = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 my-8">
    <div className="text-sm text-yellow-800">
      {children}
    </div>
  </div>
);

// Information Box
const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-primary/5 p-6 rounded-lg my-6">
    {children}
  </div>
);

// Tip Box
const TipBox = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-blue-50 border-l-4 border-blue-400 p-5 my-8">
    <div className="text-sm text-blue-800">
      {children}
    </div>
  </div>
);
```

#### Lists with Icons
```typescript
const CheckList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 my-6">
    {items.map((item, index) => (
      <li key={index} className="flex items-start">
        <span className="text-primary mr-2">✓</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);
```

#### Numbered Steps
```typescript
const NumberedSteps = ({ steps }: { steps: Array<{ title: string; description: string }> }) => (
  <ol className="space-y-4 my-6 list-none pl-0">
    {steps.map((step, index) => (
      <li key={index} className="flex items-start">
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">
          {index + 1}
        </span>
        <div>
          <strong>{step.title}:</strong> {step.description}
        </div>
      </li>
    ))}
  </ol>
);
```

### 2.4 Responsive Design

#### Mobile Optimization
```css
/* Mobile-first responsive typography */
@media (max-width: 640px) {
  .article-content {
    padding: 1.5rem 1rem;
  }
  
  .prose h1 {
    font-size: 1.875rem; /* 30px */
  }
  
  .prose h2 {
    font-size: 1.5rem; /* 24px */
  }
  
  .prose h3 {
    font-size: 1.25rem; /* 20px */
  }
  
  .callout-box {
    margin: 1.5rem -1rem;
    border-radius: 0;
    border-left: none;
    border-top: 4px solid;
  }
}
```

#### Grid Layouts
```css
/* Two-column content grids */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

### 2.5 Accessibility Standards

#### Color Contrast
- Ensure WCAG AA compliance (4.5:1 ratio for normal text)
- Use sufficient contrast for all text elements
- Provide alternative text for all images

#### Focus States
```css
.prose a:focus,
.prose button:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 2px;
}
```

#### Screen Reader Support
```typescript
// Proper heading hierarchy
// Skip navigation links
// Alt text for images
// ARIA labels for interactive elements
```

## 3. Implementation Checklist

### SEO Implementation
- [ ] Update root layout with enhanced metadata
- [ ] Implement dynamic metadata for blog posts
- [ ] Add structured data components
- [ ] Generate sitemap.xml
- [ ] Configure robots.txt
- [ ] Optimize images and fonts
- [ ] Implement Core Web Vitals monitoring
- [ ] Add Open Graph images
- [ ] Set up Google Analytics 4
- [ ] Configure Google Search Console

### Blog Formatting Implementation
- [ ] Create standardized typography classes
- [ ] Implement responsive spacing system
- [ ] Build reusable component library
- [ ] Update existing blog posts
- [ ] Test mobile responsiveness
- [ ] Validate accessibility compliance
- [ ] Create style guide documentation
- [ ] Set up automated formatting checks

### Performance Monitoring
- [ ] Set up Lighthouse CI
- [ ] Monitor Core Web Vitals
- [ ] Track SEO performance
- [ ] Implement error tracking
- [ ] Set up performance budgets

## 4. Maintenance Guidelines

### Regular SEO Audits
- Monthly technical SEO checks
- Quarterly content optimization
- Annual structured data validation
- Continuous performance monitoring

### Content Standards
- Consistent formatting across all blog posts