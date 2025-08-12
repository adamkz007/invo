import React from 'react';

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}

interface BlogPostProps {
  title: string;
  excerpt: string;
  featuredImage: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    title?: string;
    bio?: string;
  };
  category: string;
  tags: string[];
  wordCount?: number;
  readTime?: number;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export const OrganizationSchema: React.FC<OrganizationSchemaProps> = ({
  name = "Invo",
  url = "https://invo.my",
  logo = "https://invo.my/invo-logo.png",
  description = "Practical invoicing solution designed for small and medium enterprises in Malaysia"
}) => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
};

export const ArticleSchema: React.FC<{ post: BlogPostProps }> = ({ post }) => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featuredImage,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.title || "Author",
      "description": post.author.bio || ""
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
    "wordCount": post.wordCount || 0,
    "timeRequired": `PT${post.readTime || 5}M`
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
  );
};

export const BreadcrumbSchema: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
};

export const WebsiteSchema: React.FC = () => {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Invo",
    "url": "https://invo.my",
    "description": "Smart invoicing solution for Malaysian SMEs",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://invo.my/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  );
};