'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  LayoutDashboard,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/types';

interface BlogPageClientProps {
  posts: BlogPost[];
}

export default function BlogPageClient({ posts }: BlogPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const allCategories = useMemo(
    () => Array.from(new Set(posts.map((post) => post.category))),
    [posts],
  );

  useEffect(() => {
    if (selectedCategory) {
      setFilteredPosts(posts.filter((post) => post.category === selectedCategory));
    } else {
      setFilteredPosts(posts);
    }
  }, [selectedCategory, posts]);

  const featuredPost = filteredPosts.find((post) => post.featured);
  const otherPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen">
      <div className="bg-background py-3 border-b">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary bg-muted/50 px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <LayoutDashboard className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      <header className="bg-primary text-white py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
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

      <div className="py-6 bg-muted/20 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Filter by Category</h2>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isFilterOpen ? 'Hide' : 'Show'} Filters
            </Button>
          </div>

          <div className={`mt-4 flex flex-wrap gap-2 ${isFilterOpen ? 'block' : 'hidden md:flex'}`}>
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All
            </Button>

            {allCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
                {selectedCategory === category && (
                  <X
                    className="ml-1 h-3 w-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(null);
                    }}
                  />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {featuredPost && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="order-1 lg:order-2"
              >
                <Link href={`/blog/posts/${featuredPost.slug}`} className="group block">
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      width={800}
                      height={500}
                      className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/800x500/02228F/ffffff?text=${encodeURIComponent(featuredPost.category.replace(/&/g, 'and'))}`;
                      }}
                    />
                  </div>
                </Link>
              </motion.div>

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
                  <Link href={`/blog/posts/${featuredPost.slug}`} className="hover:text-primary transition-colors">
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground text-lg mb-6">{featuredPost.excerpt}</p>
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
                <Link href={`/blog/posts/${featuredPost.slug}`} className="inline-flex items-center text-primary font-medium group">
                  <span className="group-hover:mr-2 transition-all">Read Full Article</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Latest Articles</h2>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedCategory(null)}
              >
                Clear Filter <X className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          {otherPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPosts.map((post, index) => (
                <Link
                  key={post.slug ?? index}
                  href={`/blog/posts/${post.slug}`}
                  className="group bg-background rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow h-full flex flex-col"
                >
                  <div className="h-48 overflow-hidden rounded-t-lg relative">
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/600x400/02228F/ffffff?text=${encodeURIComponent(post.category.replace(/&/g, 'and'))}`;
                      }}
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-auto">
                      <div className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">
                        {post.category}
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-4">
                      <div className="flex items-center mr-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="mt-4 text-primary font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No articles found for this category.</p>
              <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                View All Articles
              </Button>
            </div>
          )}
        </div>
      </section>

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




