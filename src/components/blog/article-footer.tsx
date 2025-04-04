'use client';

import { Facebook, Linkedin, Share2, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { AuthorBio, DEFAULT_AUTHOR } from './author-bio';

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
}

interface ArticleFooterProps {
  author?: {
    name?: string;
    role?: string;
    bio?: string;
    image?: string;
  };
  relatedPosts: RelatedPost[];
  ctaTitle?: string;
  ctaDescription?: string;
}

export function ArticleFooter({
  author = DEFAULT_AUTHOR,
  relatedPosts,
  ctaTitle = "Ready to streamline your business operations?",
  ctaDescription = "Invo makes it easy for Malaysian businesses of all sizes to manage invoicing, expenses, and stay compliant with regulations. Get started today.",
}: ArticleFooterProps) {
  return (
    <>
      {/* Share Section */}
      <div className="border-t border-b py-6 my-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="font-medium mb-4 sm:mb-0">Share this article:</p>
          <div className="flex space-x-4">
            <Button variant="outline" size="icon" className="rounded-full">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Author Section */}
      <AuthorBio author={author} />

      {/* Related Posts */}
      <div className="my-12">
        <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedPosts.map((post, index) => (
            <Link 
              key={index}
              href={`/blog/posts/${post.slug}`}
              className="group bg-background rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="h-40 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={250}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/400x250/02228F/ffffff?text=${encodeURIComponent(post.category.replace(/&/g, 'and'))}`;
                  }}
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h4>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-auto">
                  <div className="flex items-center">
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white p-8 rounded-lg my-12">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">{ctaTitle}</h3>
          <p className="mb-6 text-white/90 max-w-2xl mx-auto">
            {ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button variant="secondary" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 