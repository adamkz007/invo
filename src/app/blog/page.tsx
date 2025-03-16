'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogPage() {
  // Blog posts data
  const posts = [
    {
      id: 'malaysia-e-invoicing-changes',
      title: 'Malaysia E-Invoicing: New Changes and How They Impact SMEs',
      excerpt: 'Learn about the latest e-invoicing regulations in Malaysia and what your small business needs to do to stay compliant.',
      date: 'March 15, 2023',
      author: 'Adam',
      readTime: '6 min read',
      category: 'Compliance',
      featured: true,
      image: '/blog/malaysia-e-invoicing.jpg',
      slug: 'malaysia-e-invoicing-changes'
    },
    {
      id: 'invoice-tips-small-business',
      title: '5 Invoicing Tips Every Small Business Should Know',
      excerpt: 'Improve your cash flow and get paid faster with these practical invoicing strategies for small businesses.',
      date: 'February 28, 2023',
      author: 'Adam',
      readTime: '4 min read',
      category: 'Tips & Tricks',
      featured: false,
      image: '/blog/invoice-tips.jpg',
      slug: 'invoice-tips-small-business'
    },
    {
      id: 'digital-transformation-smes',
      title: 'Digital Transformation for SMEs: Where to Start',
      excerpt: 'A step-by-step guide to beginning your digital transformation journey without overwhelming your small business.',
      date: 'February 15, 2023',
      author: 'Adam',
      readTime: '5 min read',
      category: 'Digital Transformation',
      featured: false,
      image: '/blog/digital-transformation.jpg',
      slug: 'digital-transformation-smes'
    },
    {
      id: 'tax-deductions-business-expenses',
      title: 'Tax Deductions: Business Expenses You Might Be Missing',
      excerpt: 'Don\'t leave money on the table. Discover commonly overlooked tax deductions that could save your business money.',
      date: 'January 30, 2023',
      author: 'Adam',
      readTime: '7 min read',
      category: 'Taxes',
      featured: false,
      image: '/blog/tax-deductions.jpg',
      slug: 'tax-deductions-business-expenses'
    },
    {
      id: 'inventory-management-retail',
      title: 'Inventory Management Best Practices for Retail Businesses',
      excerpt: 'Learn how to optimize your inventory management to reduce costs and improve customer satisfaction.',
      date: 'January 15, 2023',
      author: 'Adam',
      readTime: '5 min read',
      category: 'Inventory',
      featured: false,
      image: '/blog/inventory-management.jpg',
      slug: 'inventory-management-retail'
    }
  ];

  // Get featured post
  const featuredPost = posts.find(post => post.featured);
  // Get other posts
  const otherPosts = posts.filter(post => !post.featured);

  return (
    <div className="min-h-screen">
      {/* Home Link */}
      <div className="bg-background py-3 border-b">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Header with Pattern */}
      <header className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Invo Blog</h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              Insights, tips, and resources to help your small business thrive
            </p>
            <Link href="/signup">
              <Button variant="secondary" size="lg" className="font-medium">
                Get Started with Invo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="order-2 lg:order-1"
              >
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  {featuredPost.category}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                  <div className="flex items-center mr-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <User className="h-4 w-4 mr-1" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
                <Link href={`/blog/posts/${featuredPost.slug}`}>
                  <Button>
                    Read Full Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="order-1 lg:order-2"
              >
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/800x500/02228F/ffffff?text=${encodeURIComponent(featuredPost.category)}`;
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/600x400/02228F/ffffff?text=${encodeURIComponent(post.category)}`;
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">
                    {post.category}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <div className="flex items-center mr-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Link href={`/blog/posts/${post.slug}`}>
                    <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
                      Read More
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-primary/5 rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for the latest business tips, invoicing updates, and compliance news.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to streamline your invoicing?</h2>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using Invo to simplify their invoicing, track expenses, and get paid faster.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button variant="secondary" size="lg" className="font-medium">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 font-medium">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 