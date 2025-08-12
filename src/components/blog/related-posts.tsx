import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  title?: string;
  className?: string;
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({ 
  posts, 
  title = "Related Articles", 
  className 
}) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className={cn("my-12", className)}>
      <h3 className="text-2xl font-bold mb-6">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/posts/${post.slug}`}
            className="group bg-background rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow flex flex-col h-full"
          >
            <div className="h-40 overflow-hidden">
              <Image
                alt={post.title}
                loading="lazy"
                width={400}
                height={250}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                src={post.featuredImage}
              />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center text-xs text-muted-foreground mt-auto">
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-calendar h-3 w-3 mr-1"
                  >
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                  </svg>
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Single Related Post Card Component
interface RelatedPostCardProps {
  post: RelatedPost;
  className?: string;
}

export const RelatedPostCard: React.FC<RelatedPostCardProps> = ({ post, className }) => (
  <Link
    href={`/blog/posts/${post.slug}`}
    className={cn(
      "group bg-background rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow flex flex-col h-full",
      className
    )}
  >
    <div className="h-40 overflow-hidden">
      <Image
        alt={post.title}
        loading="lazy"
        width={400}
        height={250}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        src={post.featuredImage}
      />
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">
        {post.title}
      </h4>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {post.excerpt}
      </p>
      <div className="flex items-center text-xs text-muted-foreground mt-auto">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lucide lucide-calendar h-3 w-3 mr-1"
          >
            <path d="M8 2v4"></path>
            <path d="M16 2v4"></path>
            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
            <path d="M3 10h18"></path>
          </svg>
          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      </div>
    </div>
  </Link>
);