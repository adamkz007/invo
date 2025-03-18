'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// Sample guide data
const guides = [
  {
    id: 'invoicing-best-practices',
    title: 'Invoicing Best Practices for Small Businesses',
    description: 'Learn how to create professional invoices that get paid faster and help maintain healthy cash flow.',
    category: 'Invoicing',
    image: 'https://placehold.co/800x500/e2e8f0/1e293b?text=Invoicing+Guide',
    readTime: '7 min',
  },
  {
    id: 'malaysia-e-invoicing',
    title: "Malaysia e-Invoicing Guidelines: Complete Compliance Guide",
    description: "Everything you need to know about Malaysia's e-invoicing requirements and how to stay compliant.",
    category: 'Compliance',
    image: 'https://placehold.co/800x500/e2e8f0/1e293b?text=Compliance+Guide',
    readTime: '12 min',
  },
  {
    id: 'inventory-management',
    title: 'Effective Inventory Management for Small Retailers',
    description: 'Tips and strategies to optimize your inventory, reduce costs, and increase profitability.',
    category: 'Inventory',
    image: 'https://placehold.co/800x500/e2e8f0/1e293b?text=Inventory+Guide',
    readTime: '9 min',
  },
  {
    id: 'customer-relationships',
    title: 'Building and Maintaining Customer Relationships',
    description: 'How to create lasting relationships with your customers to drive repeat business and referrals.',
    category: 'Customers',
    image: 'https://placehold.co/800x500/e2e8f0/1e293b?text=Customer+Relationships',
    readTime: '8 min',
  },
  {
    id: 'financial-reports',
    title: 'Understanding Your Business Financial Reports',
    description: 'A guide to interpreting your financial statements and using them to make better business decisions.',
    category: 'Finance',
    image: 'https://placehold.co/800x500/e2e8f0/1e293b?text=Financial+Reports',
    readTime: '10 min',
  },
  {
    id: 'tax-preparation',
    title: 'Small Business Tax Preparation in Malaysia',
    description: 'Tips for preparing your taxes efficiently and maximizing deductions for your small business.',
    category: 'Taxes',
    image: 'https://placehold.co/800x500/e2e8f0/1e293b?text=Tax+Guide',
    readTime: '11 min',
  },
  {
    id: 'getting-started-invo',
    title: 'Getting Started with Invo: Complete Walkthrough',
    description: 'A step-by-step guide to setting up your Invo account and creating your first invoice.',
    category: 'Tutorial',
    image: 'https://placehold.co/800x500/e2e8f0/1e293b?text=Invo+Tutorial',
    readTime: '6 min',
  },
  {
    id: 'growing-small-business',
    title: 'Strategies for Growing Your Small Business',
    description: 'Practical advice for expanding your business operations and increasing revenue.',
    category: 'Growth',
    image: 'https://placehold.co/800x500/e2e8f0/1e293b?text=Business+Growth',
    readTime: '9 min',
  },
];

// Categories for filtering
const categories = ['All', 'Invoicing', 'Compliance', 'Inventory', 'Customers', 'Finance', 'Taxes', 'Tutorial', 'Growth'];

export default function GuidesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Filter guides based on search term and category
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Invo Guides</h1>
            <p className="text-lg md:text-xl opacity-90">
              Practical resources to help you manage your business more efficiently
            </p>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {/* Search Bar */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search guides..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Category Filter */}
              <div>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Business Guides</h2>
            {filteredGuides.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredGuides.map(guide => (
                  <Link 
                    key={guide.id}
                    href={`/guides/${guide.id}`}
                    className="group bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img 
                        src={guide.image} 
                        alt={guide.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {guide.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {guide.readTime} read
                        </span>
                      </div>
                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {guide.description}
                      </p>
                      <div className="flex justify-end">
                        <span className="text-sm text-primary font-medium flex items-center group-hover:translate-x-1 transition-transform">
                          Read Guide
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-bold mb-2">No guides found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <Button onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Get Business Tips Straight to Your Inbox</h2>
            <p className="opacity-90 mb-4">
              Join our newsletter for the latest guides, tips, and resources for small business owners.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg mb-8">
              <h3 className="text-xl font-bold mb-3 text-left">What you'll receive:</h3>
              <ul className="list-disc pl-5 space-y-1 mb-4 text-left">
                <li>Weekly business tips and best practices</li>
                <li>Early access to new guides and resources</li>
                <li>Exclusive discounts on premium business tools</li>
                <li>Updates on Malaysia's business regulations</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-3 text-left">How our newsletter process works:</h3>
              <ol className="list-decimal pl-5 space-y-1 mb-4 text-left">
                <li>Sign up with your email address</li>
                <li>Confirm your subscription via email</li>
                <li>Receive a welcome package with useful resources</li>
                <li>Get weekly newsletters every Tuesday</li>
              </ol>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-2 rounded-md text-foreground focus:outline-none"
              />
              <Button variant="secondary">
                Subscribe
              </Button>
            </div>
            <p className="text-xs opacity-75 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
} 