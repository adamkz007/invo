'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function InvoiceTipsPost() {
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
      id: 'malaysia-e-invoicing-changes',
      title: 'Malaysia E-Invoicing: New Changes and How They Impact SMEs',
      excerpt: 'Learn about the latest e-invoicing regulations in Malaysia and what your small business needs to do to stay compliant.',
      date: 'March 15, 2023',
      author: 'Adam',
      readTime: '6 min read',
      category: 'Compliance',
      image: '/blog/malaysia-e-invoicing.jpg',
      slug: 'malaysia-e-invoicing-changes'
    },
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
              Tips & Tricks
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              5 Invoicing Tips Every Small Business Should Know
            </h1>
            <div className="flex flex-wrap items-center text-sm text-white/80">
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>February 28, 2023</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <User className="h-4 w-4 mr-1" />
                <span>Adam</span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>4 min read</span>
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
              <Image
                src="/blog/invoice-tips.jpg"
                alt="Invoicing Tips for Small Businesses"
                width={1200}
                height={600}
                className="w-full h-auto"
                priority
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/1200x600/02228F/ffffff?text=Invoicing+Tips";
                }}
              />
              <figcaption className="bg-muted/50 text-center p-3 text-sm text-muted-foreground italic">
                Effective invoicing strategies can significantly improve cash flow for small businesses
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
            <h2 className="mt-0">Why Effective Invoicing Matters for Small Businesses</h2>
            <p>
              For small businesses, cash flow is king. Yet many entrepreneurs overlook the importance of an efficient invoicing process. Proper invoicing isn't just about getting paid—it's about maintaining healthy cash flow, building professional relationships with clients, and creating a solid financial foundation for your business.
            </p>
            <p>
              Based on my experience working with hundreds of SMEs, I've compiled these five essential invoicing tips that can transform your billing process and improve your bottom line.
            </p>

            <h2 className="mt-10">1. Create Clear, Professional Invoices</h2>
            <p>
              Your invoice is often the last touchpoint in a transaction with your customer, so make it count. A professional invoice reinforces your brand and helps ensure prompt payment.
            </p>
            
            <div className="bg-primary/5 p-6 rounded-lg my-6">
              <h3 className="mt-0 mb-4">Key elements every invoice should include:</h3>
              <ul className="space-y-2 my-0">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span><strong>Your business details:</strong> Name, address, contact information, and business registration number</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span><strong>Client information:</strong> Full name, address, and contact details</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span><strong>Invoice number:</strong> A unique identifier for each invoice</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span><strong>Issue date and due date:</strong> When the invoice was created and when payment is expected</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span><strong>Itemized services/products:</strong> Clear descriptions, quantities, rates, and subtotals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span><strong>Payment terms and methods:</strong> Accepted payment options and any late payment policies</span>
                </li>
              </ul>
            </div>

            <h2 className="mt-10">2. Set Clear Payment Terms</h2>
            <p>
              Ambiguous payment terms lead to delayed payments. Be explicit about when and how you expect to be paid.
            </p>
            <p>
              Consider these strategies for setting effective payment terms:
            </p>
            <ul className="my-6">
              <li className="mb-2"><strong>Shorter payment windows:</strong> Instead of the traditional 30 days, consider 14 or even 7-day payment terms.</li>
              <li className="mb-2"><strong>Early payment incentives:</strong> Offer a small discount (2-3%) for payments received within a week.</li>
              <li className="mb-2"><strong>Late payment fees:</strong> Clearly state any penalties for overdue payments.</li>
              <li><strong>Upfront deposits:</strong> For larger projects, request 30-50% payment upfront.</li>
            </ul>
            <p>
              Whatever terms you choose, communicate them clearly before starting work and reinforce them on your invoices.
            </p>

            <h2 className="mt-10">3. Embrace Digital Invoicing</h2>
            <p>
              Paper invoices are outdated, inefficient, and easy to lose. Digital invoicing solutions offer numerous advantages:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-green-800 mt-0 mb-4">Benefits of Digital Invoicing</h3>
                <ul className="space-y-2 my-0 text-green-700">
                  <li><strong>Speed:</strong> Send invoices instantly after completing work</li>
                  <li><strong>Automation:</strong> Set up recurring invoices for regular clients</li>
                  <li><strong>Tracking:</strong> Monitor when invoices are viewed and paid</li>
                  <li><strong>Organization:</strong> Keep all invoices in one searchable system</li>
                  <li><strong>Integration:</strong> Connect with accounting and tax software</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-blue-800 mt-0 mb-4">Digital Payment Options</h3>
                <ul className="space-y-2 my-0 text-blue-700">
                  <li><strong>Bank transfers:</strong> Direct and usually fee-free</li>
                  <li><strong>Credit cards:</strong> Convenient but may incur processing fees</li>
                  <li><strong>Digital wallets:</strong> Fast and increasingly popular</li>
                  <li><strong>Payment gateways:</strong> Secure online payment processing</li>
                  <li><strong>QR code payments:</strong> Growing in popularity in Malaysia</li>
                </ul>
              </div>
            </div>

            <h2 className="mt-10">4. Follow Up on Overdue Invoices</h2>
            <p>
              Even with the best invoicing practices, you'll occasionally encounter late payments. Having a systematic follow-up process is crucial.
            </p>
            
            <div className="bg-primary/5 p-6 rounded-lg my-6">
              <h3 className="mt-0 mb-4">Effective follow-up timeline:</h3>
              <ol className="space-y-4 my-0 list-none pl-0">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">1</span>
                  <div>
                    <strong>Payment due date:</strong> Send a friendly payment reminder email
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">2</span>
                  <div>
                    <strong>3 days overdue:</strong> Send a second reminder with the invoice attached
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">3</span>
                  <div>
                    <strong>7 days overdue:</strong> Make a phone call to discuss the payment
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">4</span>
                  <div>
                    <strong>14+ days overdue:</strong> Send a formal overdue notice with any applicable late fees
                  </div>
                </li>
              </ol>
            </div>
            
            <p>
              Keep your follow-ups professional and courteous. Remember that payment issues are often due to oversight rather than intentional delay.
            </p>

            <h2 className="mt-10">5. Track and Analyze Your Invoicing Metrics</h2>
            <p>
              What gets measured gets managed. Tracking key invoicing metrics helps you identify issues and optimize your cash flow.
            </p>
            <p>
              Important metrics to monitor include:
            </p>
            <ul className="my-6">
              <li className="mb-2"><strong>Average payment time:</strong> How long it typically takes to receive payment</li>
              <li className="mb-2"><strong>Late payment rate:</strong> Percentage of invoices paid after the due date</li>
              <li className="mb-2"><strong>Aging accounts receivable:</strong> Outstanding invoices grouped by time overdue</li>
              <li><strong>Collection effectiveness:</strong> Percentage of receivables collected in a given period</li>
            </ul>
            <p>
              Regularly reviewing these metrics can help you identify problematic clients or inefficiencies in your invoicing process.
            </p>

            <h2 className="mt-10">Conclusion</h2>
            <p>
              Implementing these five invoicing tips can significantly improve your cash flow and reduce the time you spend on financial administration. Remember that invoicing isn't just a back-office function—it's an integral part of your customer experience and financial health.
            </p>
            <p>
              By creating professional invoices, setting clear terms, embracing digital solutions, following up systematically, and tracking key metrics, you'll build a more efficient and effective invoicing process for your small business.
            </p>
            <p className="text-lg font-medium text-primary">
              Ready to streamline your invoicing process? Invo offers a complete invoicing solution designed specifically for Malaysian SMEs, with all these best practices built in.
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
                <Image
                  src="/blog/authors/adam.jpg"
                  alt="Adam"
                  width={64}
                  height={64}
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
            <h3 className="text-xl font-bold mb-6">Related Articles</h3>
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
                        e.currentTarget.src = "https://placehold.co/400x250/02228F/ffffff?text=Related+Article";
                      }}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-auto">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
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
              <h3 className="text-2xl font-bold mb-4">Ready to streamline your invoicing process?</h3>
              <p className="mb-6 text-white/90 max-w-2xl mx-auto">
                Invo makes it easy for Malaysian businesses of all sizes to create professional invoices, track payments, and improve cash flow. Get started today.
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