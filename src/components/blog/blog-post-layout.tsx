'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, FileText, User } from 'lucide-react';
import { ReactNode } from 'react';
import { ArticleFooter } from './article-footer';
import { DEFAULT_AUTHOR } from './author-bio';

interface BlogPostLayoutProps {
  title: string;
  category: string;
  date: string;
  author?: {
    name?: string;
    role?: string;
    bio?: string;
    image?: string;
  };
  readTime: string;
  featuredImage: string;
  imageAlt?: string;
  imageCaption?: string;
  relatedPosts: Array<{
    id: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    readTime: string;
    category: string;
    image: string;
    slug: string;
  }>;
  ctaTitle?: string;
  ctaDescription?: string;
  children: ReactNode;
}

export function BlogPostLayout({
  title,
  category,
  date,
  author = DEFAULT_AUTHOR,
  readTime,
  featuredImage,
  imageAlt,
  imageCaption,
  relatedPosts,
  ctaTitle,
  ctaDescription,
  children
}: BlogPostLayoutProps) {
  return (
    <div className="blog-post-shell">
      {/* Header */}
      <header className="blog-post-header">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="blog-post-back-link">
              <ArrowLeft className="h-4 w-4" />
              <FileText className="h-4 w-4" />
              <span>Blog</span>
            </Link>
            <div className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
              {category}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              {title}
            </h1>
            <div className="flex flex-wrap items-center text-sm text-white/80">
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{date}</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <User className="h-4 w-4 mr-1" />
                <span>{author.name}</span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>{readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="blog-post-hero">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="blog-post-hero-card"
          >
            <figure className="m-0">
              <Image
                src={featuredImage}
                alt={imageAlt || title}
                width={1200}
                height={675}
                className="w-full h-auto"
                priority
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/1200x675/02228F/ffffff?text=${encodeURIComponent(category.replace(/&/g, 'and'))}`;
                }}
              />
              {imageCaption && (
                <figcaption className="bg-muted/50 text-center p-3 text-sm text-muted-foreground italic">
                  {imageCaption}
                </figcaption>
              )}
            </figure>
          </motion.div>
        </div>
      </div>

      {/* Article Content */}
      <article className="blog-post-content">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="blog-post-prose"
          >
            {children}
          </motion.div>

          <ArticleFooter 
            author={author}
            relatedPosts={relatedPosts}
            ctaTitle={ctaTitle}
            ctaDescription={ctaDescription}
          />
        </div>
      </article>
    </div>
  );
} 
