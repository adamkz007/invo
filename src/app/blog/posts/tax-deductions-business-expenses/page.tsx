'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CaptionedImage } from '@/components/ui/captioned-image';
import Image from 'next/image';

export default function TaxDeductionsPost() {
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
      date: 'February 28, 2025',
      author: 'Adam',
      readTime: '6 min read',
      category: 'Compliance',
      image: '/blog/malaysia-e-invoicing.jpg',
      slug: 'malaysia-e-invoicing-changes'
    },
    {
      id: 'invoice-tips-small-business',
      title: 'Essential Invoicing Tips for Small Business Success',
      excerpt: 'Discover how proper invoicing can improve your cash flow and enhance your professional image with customers.',
      date: 'February 28, 2025',
      author: 'Adam',
      readTime: '7 min read',
      category: 'Invoicing',
      image: '/blog/invoice-tips.jpg',
      slug: 'invoice-tips-small-business'
    },
    {
      id: 'digital-transformation-smes',
      title: 'Digital Transformation for SMEs: Where to Start',
      excerpt: 'A practical guide to beginning your digital transformation journey without overwhelming your resources or team.',
      date: 'February 28, 2025',
      author: 'Adam',
      readTime: '9 min read',
      category: 'Digital Transformation',
      image: '/blog/digital-transformation.jpg',
      slug: 'digital-transformation-smes'
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
              Taxes
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Tax Deductions: Business Expenses You Might Be Missing
            </h1>
            <div className="flex flex-wrap items-center text-sm text-white/80">
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>January 30, 2023</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <User className="h-4 w-4 mr-1" />
                <span>Adam</span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>7 min read</span>
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
                src="/blog/tax-deductions.jpg"
                alt="Tax Deductions for Business Expenses"
                width={1200}
                height={675}
                className="w-full h-auto"
                priority
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/1200x675/02228F/ffffff?text=Tax+Deductions";
                }}
              />
              <figcaption className="bg-muted/50 text-center p-3 text-sm text-muted-foreground italic">
                Lobby at Doubletree by Hilton, Putrajaya Lakeside
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
            <h2 className="mt-0">The Hidden Value in Your Business Expenses</h2>
            <p>
              As a business owner in Malaysia, you're likely familiar with common tax deductions like office rent, employee salaries, and utilities. However, many SMEs leave money on the table by overlooking legitimate business expenses that qualify for tax deductions.
            </p>
            <p>
              With proper documentation and understanding of Malaysia's tax laws, you can significantly reduce your taxable income while staying fully compliant with Inland Revenue Board (LHDN) regulations.
            </p>
            <p>
              In this article, we'll explore often-missed tax deductions that could save your business thousands of ringgit when filing your annual tax returns.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 my-8">
              <p className="text-sm text-yellow-800 m-0">
                <strong>Disclaimer:</strong> While this article provides general information about tax deductions in Malaysia, tax laws change frequently. Always consult with a qualified tax professional for advice specific to your business situation.
              </p>
            </div>

            <h2 className="mt-10">Home Office Deductions</h2>
            <p>
              With the rise of remote work, many business owners operate partially or fully from home. If you use part of your home exclusively for business, you may be eligible for home office deductions.
            </p>
            
            <h3 className="mt-8">What Qualifies:</h3>
            <ul className="my-6">
              <li className="mb-2"><strong>Dedicated space:</strong> A specific area used exclusively for business</li>
              <li className="mb-2"><strong>Proportional expenses:</strong> A percentage of rent, utilities, and internet based on the space used for business</li>
              <li className="mb-2"><strong>Home office furniture:</strong> Desks, chairs, and storage purchased for business use</li>
              <li><strong>Home office renovations:</strong> Modifications made specifically for business purposes</li>
            </ul>
            
            <div className="bg-primary/5 p-6 rounded-lg my-6">
              <h4 className="mt-0 mb-4">Calculation Example:</h4>
              <p className="my-0">
                If your home is 1,500 square feet and your home office occupies 150 square feet (10% of the total area), you can deduct 10% of eligible home expenses:
              </p>
              <ul className="mt-4 mb-0">
                <li>Monthly rent: RM2,000 × 10% = RM200 deductible per month</li>
                <li>Utilities: RM300 × 10% = RM30 deductible per month</li>
                <li>Internet: RM150 × 10% = RM15 deductible per month</li>
              </ul>
              <p className="mt-4 mb-0">
                Total annual deduction: RM245 × 12 months = RM2,940
              </p>
            </div>

            <h2 className="mt-10">Professional Development and Education</h2>
            <p>
              Investments in your own knowledge and skills—or those of your employees—are often deductible when they relate to your current business.
            </p>
            
            <h3 className="mt-8">Deductible Educational Expenses:</h3>
            <ul className="my-6">
              <li className="mb-2"><strong>Industry conferences and seminars:</strong> Registration fees, travel, and accommodation</li>
              <li className="mb-2"><strong>Professional courses and certifications:</strong> Courses that maintain or improve skills needed in your current business</li>
              <li className="mb-2"><strong>Business books and subscriptions:</strong> Professional publications and online learning platforms</li>
              <li><strong>Employee training programs:</strong> Workshops and courses to upskill your team</li>
            </ul>
            
            <p>
              Remember that educational expenses must be directly related to your current business. Courses that qualify you for a new profession generally aren't deductible.
            </p>

            <h2 className="mt-10">Vehicle and Travel Expenses</h2>
            <p>
              Business-related travel expenses are deductible, but many business owners don&apos;t track these expenses properly or miss eligible deductions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
              <div className="bg-primary/5 p-6 rounded-lg">
                <h3 className="mt-0 mb-4">Vehicle Expenses</h3>
                <ul className="space-y-2 my-0">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Mileage:</strong> Business-related travel (not commuting)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Fuel:</strong> For business trips and client visits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Maintenance:</strong> Proportional to business use</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Tolls and parking:</strong> For business purposes</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-primary/5 p-6 rounded-lg">
                <h3 className="mt-0 mb-4">Business Travel</h3>
                <ul className="space-y-2 my-0">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Airfare and transportation:</strong> To business destinations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Accommodation:</strong> Hotels during business trips</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Meals:</strong> 50% of business meals while traveling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Internet and communication:</strong> While traveling</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 my-8">
              <p className="text-sm text-yellow-800 m-0">
                <strong>Documentation Tip:</strong> Keep a detailed log of all business travel, including dates, destinations, purpose, and mileage. Use apps like Invo to capture and categorize receipts immediately to ensure nothing is missed.
              </p>
            </div>

            <h2 className="mt-10">Technology and Digital Expenses</h2>
            <p>
              In today's digital business environment, technology expenses are essential and often fully deductible.
            </p>
            
            <CaptionedImage 
              src="/blog/tech-expenses.jpg" 
              alt="Technology expenses for business"
              caption="Modern businesses rely on various digital tools that can qualify for tax deductions"
              fallbackText="Tech Expenses"
            />
            
            <h3 className="mt-8">Commonly Overlooked Tech Deductions:</h3>
            <ul className="my-6">
              <li className="mb-2"><strong>Software subscriptions:</strong> Accounting software, CRM systems, design tools, and other business applications</li>
              <li className="mb-2"><strong>Cloud storage and hosting:</strong> Website hosting, data storage, and backup services</li>
              <li className="mb-2"><strong>Digital marketing:</strong> Social media advertising, SEO services, and email marketing platforms</li>
              <li className="mb-2"><strong>Hardware:</strong> Computers, tablets, smartphones, and peripherals used for business</li>
              <li className="mb-2"><strong>Cybersecurity:</strong> Antivirus software, VPN services, and security consultations</li>
              <li><strong>Domain names and digital assets:</strong> Website domains, premium digital tools, and online subscriptions</li>
            </ul>
            
            <p>
              For hardware purchases, you'll typically need to depreciate items over several years rather than deducting the full amount in the year of purchase. However, Malaysia's tax laws do allow for accelerated depreciation for certain IT equipment.
            </p>

            <h2 className="mt-10">Insurance Premiums</h2>
            <p>
              Various insurance policies that protect your business are tax-deductible expenses that business owners sometimes overlook.
            </p>
            
            <h3 className="mt-8">Deductible Insurance Types:</h3>
            <ul className="my-6">
              <li className="mb-2"><strong>Professional liability insurance:</strong> Protects against claims of negligence or harm</li>
              <li className="mb-2"><strong>Property insurance:</strong> Covers business property against damage or theft</li>
              <li className="mb-2"><strong>Business interruption insurance:</strong> Replaces income lost due to disaster-related closures</li>
              <li className="mb-2"><strong>Key person insurance:</strong> Compensates for the loss of an essential team member</li>
              <li><strong>Group health insurance:</strong> Medical coverage for employees</li>
            </ul>
            
            <p>
              Note that life insurance premiums are generally not deductible unless the company is the beneficiary and the policy covers a key employee.
            </p>

            <h2 className="mt-10">Bank Fees and Interest</h2>
            <p>
              Financial costs associated with running your business are often deductible but frequently overlooked.
            </p>
            
            <h3 className="mt-8">Deductible Financial Expenses:</h3>
            <ul className="my-6">
              <li className="mb-2"><strong>Business account fees:</strong> Monthly maintenance fees, transaction fees, and statement fees</li>
              <li className="mb-2"><strong>Merchant account fees:</strong> Costs for accepting credit card payments</li>
              <li className="mb-2"><strong>Interest on business loans:</strong> Interest paid on loans used for business purposes</li>
              <li className="mb-2"><strong>Payment processing fees:</strong> Charges from payment platforms like PayPal or Stripe</li>
              <li><strong>Foreign transaction fees:</strong> Fees for international business payments</li>
            </ul>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 my-8">
              <p className="text-sm text-yellow-800 m-0">
                <strong>Important Note:</strong> Interest on loans used for both personal and business purposes must be allocated proportionally. Only the business portion is deductible.
              </p>
            </div>

            <h2 className="mt-10">Bad Debts</h2>
            <p>
              If you've provided services or products but haven't been paid despite reasonable collection efforts, you may be able to deduct these bad debts.
            </p>
            
            <h3 className="mt-8">Requirements for Bad Debt Deductions:</h3>
            <ul className="my-6">
              <li className="mb-2"><strong>Previously included in income:</strong> The amount must have been reported as income in a prior year</li>
              <li className="mb-2"><strong>Genuine attempt to collect:</strong> You must have made reasonable efforts to collect the debt</li>
              <li className="mb-2"><strong>Written off in your books:</strong> The debt must be officially written off in your accounting records</li>
              <li><strong>Documentation:</strong> Keep records of invoices, collection attempts, and correspondence</li>
            </ul>
            
            <p>
              For businesses using accrual accounting, bad debt deductions can be significant tax savers in years with uncollectible accounts.
            </p>

            <h2 className="mt-10">Maximizing Your Deductions: Best Practices</h2>
            
            <div className="bg-primary/5 p-6 rounded-lg my-6">
              <h3 className="mt-0 mb-4">Tips for Proper Documentation:</h3>
              <ol className="space-y-4 my-0 list-none pl-0">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">1</span>
                  <div>
                    <strong>Separate business and personal expenses:</strong> Maintain dedicated business accounts and credit cards
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">2</span>
                  <div>
                    <strong>Digitize receipts immediately:</strong> Use apps like Invo to capture and categorize receipts before they're lost
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">3</span>
                  <div>
                    <strong>Record business purpose:</strong> Note the business reason for each expense (client name, business discussion, etc.)
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">4</span>
                  <div>
                    <strong>Maintain organized records:</strong> Keep supporting documents for at least 7 years (LHDN requirement)
                  </div>
                </li>
              </ol>
            </div>

            <h2 className="mt-10">Conclusion</h2>
            <p>
              Taking advantage of all eligible tax deductions is not about avoiding taxes—it's about not paying more than you legally owe. By properly tracking and documenting your business expenses, you can significantly reduce your taxable income while maintaining full compliance with Malaysian tax laws.
            </p>
            <p>
              Remember that tax laws change frequently, and some deductions have specific limitations or requirements. Working with a qualified tax professional who understands your industry can help ensure you're maximizing your deductions while staying compliant.
            </p>
            <p className="text-lg font-medium text-primary">
              Start implementing better expense tracking today. With digital tools like Invo, you can easily capture, categorize, and store receipts and invoices, making tax time less stressful and potentially saving your business thousands of ringgit.
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
              <h3 className="text-2xl font-bold mb-4">Make tax season easier with Invo</h3>
              <p className="mb-6 text-white/90 max-w-2xl mx-auto">
                Automatically track expenses, categorize receipts, and generate tax-ready reports. Invo helps Malaysian businesses stay organized year-round and maximize deductions at tax time.
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