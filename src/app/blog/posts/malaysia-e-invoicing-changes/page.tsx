'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CaptionedImage } from '@/components/ui/captioned-image';

export default function MalaysiaEInvoicingPost() {
  // Define related posts
  const relatedPosts: {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    readTime: string;
    category: string;
    image: string;
    slug: string;
  }[] = [
    {
      id: 'digital-transformation-smes',
      title: 'Digital Transformation for SMEs: Where to Start',
      excerpt: 'A step-by-step guide to beginning your digital transformation journey without overwhelming your small business.',
      date: 'February 15, 2023',
      author: 'Adam',
      readTime: '5 min read',
      category: 'Digital Transformation',
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
      image: '/blog/tax-deductions.jpg',
      slug: 'tax-deductions-business-expenses'
    },
    {
      id: 'invoice-tips-small-business',
      title: '5 Invoicing Tips Every Small Business Should Know',
      excerpt: 'Improve your cash flow and get paid faster with these practical invoicing strategies for small businesses.',
      date: 'February 28, 2023',
      author: 'Adam',
      readTime: '4 min read',
      category: 'Tips & Tricks',
      image: '/blog/invoice-tips.jpg',
      slug: 'invoice-tips-small-business'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="inline-flex items-center text-white/90 hover:text-white mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
            <div className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
              Compliance
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Malaysia E-Invoicing: New Changes and How They Impact SMEs
            </h1>
            <div className="flex flex-wrap items-center text-sm text-white/80">
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>March 15, 2023</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <User className="h-4 w-4 mr-1" />
                <span>Adam</span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>6 min read</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="container mx-auto px-4 -mt-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-lg overflow-hidden shadow-xl"
          >
            <figure className="m-0">
              <img
                src="/blog/malaysia-e-invoicing.jpg"
                alt="Malaysia E-Invoicing"
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/1200x600/02228F/ffffff?text=Malaysia+E-Invoicing";
                }}
              />
              <figcaption className="bg-muted/50 text-center p-3 text-sm text-muted-foreground italic">
                Malaysia's new e-invoicing regulations will transform how businesses manage their financial documentation
              </figcaption>
            </figure>
          </motion.div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-lg max-w-none prose-headings:text-primary prose-headings:font-bold prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:text-xl md:prose-h3:text-2xl prose-p:text-base prose-p:leading-relaxed prose-li:text-base prose-li:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-primary prose-strong:font-bold"
          >
            <h2 className="mt-0">Understanding Malaysia's E-Invoicing Initiative</h2>
            <p>
              Malaysia is joining the global shift towards digitizing tax administration through the implementation of a comprehensive e-invoicing system. This initiative, led by the Inland Revenue Board of Malaysia (LHDN), aims to enhance tax compliance, reduce tax leakage, and streamline business processes.
            </p>
            
            <CaptionedImage 
              src="/blog/e-invoicing-system.jpg" 
              alt="Malaysia E-Invoicing System"
              caption="The new e-invoicing system will connect businesses directly with Malaysia's tax authorities"
              fallbackText="E-Invoicing System"
            />
            
            <p>
              The e-invoicing mandate represents a significant change in how businesses issue, transmit, and store invoices. Instead of traditional paper invoices or simple digital formats like PDFs, businesses will need to generate structured digital invoices that comply with specific technical standards and can be transmitted directly to the tax authorities.
            </p>

            <h2 className="mt-10">Key Changes in Malaysia's E-Invoicing Framework</h2>
            <p>
              The new e-invoicing system in Malaysia introduces several significant changes that businesses need to be aware of:
            </p>

            <h3 className="mt-8">1. Phased Implementation Timeline</h3>
            <div className="bg-primary/5 p-6 rounded-lg my-6">
              <ul className="space-y-3 my-0">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">1</span>
                  <div>
                    <strong>Phase 1 (August 2023):</strong> Voluntary adoption period for businesses to test and adapt their systems
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">2</span>
                  <div>
                    <strong>Phase 2 (January 2024):</strong> Mandatory for businesses with annual revenue exceeding RM 100 million
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">3</span>
                  <div>
                    <strong>Phase 3 (July 2024):</strong> Extended to businesses with annual revenue between RM 25 million and RM 100 million
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">4</span>
                  <div>
                    <strong>Phase 4 (January 2025):</strong> All remaining businesses including SMEs
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 my-8">
              <p className="text-sm text-yellow-800 m-0">
                <strong>Update:</strong> The Malaysian Finance Minister has announced a delay until 1 January 2026 for Phase 3 of mandatory e-invoicing for some SMEs with annual sales between RM500,000 and RM150,000. Businesses below RM 150,000 are exempted from the mandate.
              </p>
            </div>

            <h3 className="mt-8">2. Technical Requirements</h3>
            <p>
              The Malaysian e-invoicing system will follow a standardized format based on the PEPPOL (Pan-European Public Procurement Online) framework, which includes:
            </p>
            <ul className="my-6">
              <li className="mb-2">Unique invoice identification</li>
              <li className="mb-2">Digital signatures for authentication</li>
              <li className="mb-2">Structured data format (XML/JSON)</li>
              <li className="mb-2">Specific mandatory fields including tax information</li>
              <li>Real-time or near real-time transmission to LHDN</li>
            </ul>

            <h3 className="mt-8">3. Compliance Requirements</h3>
            <p>
              Under the new framework, businesses must:
            </p>
            <ul className="my-6">
              <li className="mb-2">Register for the e-invoicing system through the LHDN portal</li>
              <li className="mb-2">Ensure all invoices comply with the prescribed format</li>
              <li className="mb-2">Maintain digital records for at least 7 years</li>
              <li className="mb-2">Implement systems capable of generating and transmitting e-invoices</li>
              <li>Provide training to staff on the new requirements</li>
            </ul>

            <h2 className="mt-10">How These Changes Impact SMEs</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-red-800 mt-0 mb-4">Immediate Challenges</h3>
                <ul className="space-y-2 my-0 text-red-700">
                  <li><strong>Technology Investment:</strong> Many small businesses may need to upgrade their existing systems</li>
                  <li><strong>Learning Curve:</strong> Staff will need training to understand new processes</li>
                  <li><strong>Initial Setup Costs:</strong> System configuration and integration expenses</li>
                  <li><strong>Workflow Adjustments:</strong> Existing business processes may need modification</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-green-800 mt-0 mb-4">Long-term Benefits</h3>
                <ul className="space-y-2 my-0 text-green-700">
                  <li><strong>Reduced Admin Work:</strong> Automation reduces manual work and errors</li>
                  <li><strong>Faster Payments:</strong> E-invoices are processed and paid more quickly</li>
                  <li><strong>Better Cash Flow:</strong> Real-time visibility into invoice status</li>
                  <li><strong>Cost Savings:</strong> Reduced printing, postage, and storage costs</li>
                </ul>
              </div>
            </div>

            <h2 className="mt-10">Preparing Your SME for Malaysia's E-Invoicing</h2>

            <div className="my-8">
              <h3 className="mt-8">1. Assess Your Current Systems</h3>
              <p>
                Start by evaluating your existing invoicing processes and systems. Determine whether they can be upgraded to meet the new requirements or if you need to invest in new solutions.
              </p>

              <h3 className="mt-8">2. Choose the Right Solution</h3>
              <p>
                Look for invoicing software that:
              </p>
              <div className="bg-primary/5 p-6 rounded-lg my-6">
                <ul className="space-y-3 my-0">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Is compliant with Malaysia's e-invoicing standards</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Integrates with your existing accounting and ERP systems</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Offers good user experience and support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Provides value for money with scalability as your business grows</span>
                  </li>
                </ul>
              </div>

              <h3 className="mt-8">3. Plan for Implementation</h3>
              <p>
                Develop a timeline for implementation that allows for:
              </p>
              <ol className="list-decimal pl-5 my-6">
                <li className="mb-2">System setup and configuration</li>
                <li className="mb-2">Staff training</li>
                <li className="mb-2">Testing and troubleshooting</li>
                <li>Gradual transition from old to new systems</li>
              </ol>

              <h3 className="mt-8">4. Stay Informed</h3>
              <p>
                Keep up to date with announcements from LHDN regarding any changes or updates to the e-invoicing requirements. Join industry forums or chambers of commerce where these topics are discussed.
              </p>
            </div>

            <h2 className="mt-10">How Invo Can Help</h2>
            <div className="bg-primary/10 p-6 rounded-lg my-6">
              <p className="mt-0">
                At Invo, we're committed to helping SMEs navigate the transition to e-invoicing in Malaysia. Our platform is being updated to fully comply with the new requirements, offering:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 my-4">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Automatic generation of compliant e-invoices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Secure transmission to LHDN</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Digital storage of all invoice data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Easy integration with existing systems</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>User-friendly interface requiring minimal training</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Affordable pricing plans for SMEs</span>
                </li>
              </ul>
            </div>

            <h2 className="mt-10">Conclusion</h2>
            <p>
              Malaysia's e-invoicing initiative represents a significant shift in how businesses manage their invoicing and tax compliance. While the transition may present initial challenges for SMEs, the long-term benefits in terms of efficiency, cost savings, and improved cash flow management are substantial.
            </p>
            <p>
              By starting preparations early and choosing the right tools and partners, small businesses can not only comply with the new requirements but also leverage e-invoicing as an opportunity to modernize their financial processes and gain a competitive edge.
            </p>
            <p className="text-lg font-medium text-primary">
              Stay ahead of the curve by beginning your e-invoicing journey today, well before the mandatory implementation date for SMEs.
            </p>
          </motion.div>

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
          <div className="bg-muted/30 rounded-lg p-6 my-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                <img
                  src="/blog/authors/adam.jpg"
                  alt="Adam"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/200x200/02228F/ffffff?text=A";
                  }}
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-lg">Adam</h3>
                <p className="text-sm text-muted-foreground mb-2">Founder</p>
                <p className="text-sm">
                  Adam consults for both large organizations and SMEs to identify & optimize finance processes. Growing tired of clunky invoice tools available in the market, he sets out to build Invo.
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <div className="my-12">
            <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-background rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-all group"
                >
                  <Link href={`/blog/posts/${post.slug}`} className="block h-full">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/600x400/02228F/ffffff?text=${encodeURIComponent(post.category)}`;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-2">
                        {post.category}
                      </div>
                      <h4 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-primary text-white p-8 rounded-lg my-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to simplify your e-invoicing compliance?</h3>
              <p className="mb-6 text-white/90 max-w-2xl mx-auto">
                Invo makes it easy for Malaysian businesses of all sizes to comply with the new e-invoicing requirements. Get started today and stay ahead of the regulatory changes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" size="lg" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
} 