'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function DigitalTransformationPost() {
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
      id: 'invoice-tips-small-business',
      title: '5 Invoicing Tips Every Small Business Should Know',
      excerpt: 'Improve your cash flow and get paid faster with these practical invoicing strategies for small businesses.',
      date: 'February 28, 2023',
      author: 'Adam',
      readTime: '4 min read',
      category: 'Tips & Tricks',
      image: '/blog/invoice-tips.jpg',
      slug: 'invoice-tips-small-business'
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
              Digital Transformation
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Digital Transformation for SMEs: Where to Start
            </h1>
            <div className="flex flex-wrap items-center text-sm text-white/80">
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>February 15, 2023</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <User className="h-4 w-4 mr-1" />
                <span>Adam</span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>5 min read</span>
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
                src="/blog/digital-transformation.jpg"
                alt="Digital Transformation for SMEs"
                width={1200}
                height={675}
                className="w-full h-auto"
                priority
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/1200x675/02228F/ffffff?text=Digital+Transformation";
                }}
              />
              <figcaption className="bg-muted/50 text-center p-3 text-sm text-muted-foreground italic">
                Interior ceiling details at Convivencia Cafe, ISTAC KL
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
            <h2 className="mt-0">Understanding Digital Transformation for Small Businesses</h2>
            <p>
              Digital transformation isn't just for large corporations with massive IT budgets. In fact, small and medium enterprises (SMEs) often have the advantage of agility and can implement digital changes more quickly than their larger counterparts.
            </p>
            <p>
              But what exactly is digital transformation? At its core, it's about using technology to fundamentally change how your business operates and delivers value to customers. It's not just about adopting new tools—it's about rethinking processes, culture, and customer experiences through a digital lens.
            </p>
            <p>
              For Malaysian SMEs, digital transformation has become increasingly important, especially in the wake of changing consumer behaviors and regulatory requirements like the new e-invoicing mandate.
            </p>

            <h2 className="mt-10">Why Digital Transformation Matters for SMEs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
              <div className="bg-primary/5 p-6 rounded-lg">
                <h3 className="mt-0 mb-4">Business Benefits</h3>
                <ul className="space-y-2 my-0">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Increased efficiency:</strong> Automate repetitive tasks and streamline workflows</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Cost reduction:</strong> Minimize manual processes and paperwork</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Better decision-making:</strong> Access to real-time data and analytics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Enhanced customer experience:</strong> Meet evolving customer expectations</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-primary/5 p-6 rounded-lg">
                <h3 className="mt-0 mb-4">Competitive Advantages</h3>
                <ul className="space-y-2 my-0">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Market expansion:</strong> Reach new customers through digital channels</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Business resilience:</strong> Adapt quickly to market changes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Talent attraction:</strong> Appeal to digitally-savvy employees</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Regulatory compliance:</strong> Meet evolving digital requirements</span>
                  </li>
                </ul>
              </div>
            </div>

            <h2 className="mt-10">A Step-by-Step Approach to Digital Transformation</h2>
            <p>
              Digital transformation can seem overwhelming, but breaking it down into manageable steps makes it achievable for businesses of any size. Here's a practical roadmap:
            </p>

            <h3 className="mt-8">1. Assess Your Current Digital Maturity</h3>
            <p>
              Before making changes, understand where you stand. Evaluate your:
            </p>
            <ul className="my-6">
              <li className="mb-2"><strong>Existing technology:</strong> What systems and tools are you currently using?</li>
              <li className="mb-2"><strong>Digital skills:</strong> What capabilities do your team members have?</li>
              <li className="mb-2"><strong>Business processes:</strong> Which processes are manual and could benefit from digitalization?</li>
              <li><strong>Customer touchpoints:</strong> How do customers interact with your business digitally?</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 my-8">
              <p className="text-sm text-yellow-800 m-0">
                <strong>Pro Tip:</strong> Create a simple scorecard rating your digital maturity across different business functions (e.g., finance, marketing, operations) on a scale of 1-5 to identify priority areas.
              </p>
            </div>

            <h3 className="mt-8">2. Define Clear Objectives</h3>
            <p>
              Digital transformation should solve specific business problems or create new opportunities. Common objectives include:
            </p>
            <ul className="my-6">
              <li className="mb-2"><strong>Improving operational efficiency</strong> (e.g., reducing invoice processing time by 50%)</li>
              <li className="mb-2"><strong>Enhancing customer experience</strong> (e.g., enabling self-service options)</li>
              <li className="mb-2"><strong>Enabling data-driven decision making</strong> (e.g., implementing sales analytics)</li>
              <li><strong>Creating new revenue streams</strong> (e.g., developing online sales channels)</li>
            </ul>
            <p>
              Make your objectives SMART: Specific, Measurable, Achievable, Relevant, and Time-bound.
            </p>

            <h3 className="mt-8">3. Prioritize High-Impact, Low-Effort Initiatives</h3>
            <p>
              Not all digital initiatives are created equal. Start with those that offer the best return on investment and build momentum:
            </p>
            
            <div className="bg-primary/5 p-6 rounded-lg my-6">
              <h4 className="mt-0 mb-4">Quick Wins for Malaysian SMEs:</h4>
              <ol className="space-y-4 my-0 list-none pl-0">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">1</span>
                  <div>
                    <strong>Cloud-based accounting software:</strong> Prepare for e-invoicing requirements while improving financial visibility
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">2</span>
                  <div>
                    <strong>Digital payment options:</strong> Offer customers convenient ways to pay and improve cash flow
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">3</span>
                  <div>
                    <strong>Social media presence:</strong> Build brand awareness and engage with customers where they spend time
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3 shrink-0">4</span>
                  <div>
                    <strong>Basic website or e-commerce platform:</strong> Establish a digital storefront for your business
                  </div>
                </li>
              </ol>
            </div>

            <h3 className="mt-8">4. Secure Buy-in and Build Digital Culture</h3>
            <p>
              Digital transformation is as much about people as it is about technology. To succeed:
            </p>
            <ul className="my-6">
              <li className="mb-2"><strong>Communicate the vision</strong> and benefits to all stakeholders</li>
              <li className="mb-2"><strong>Involve employees</strong> in the process to gain their insights and support</li>
              <li className="mb-2"><strong>Provide training</strong> to build necessary skills and confidence</li>
              <li><strong>Lead by example</strong> by embracing digital tools yourself</li>
            </ul>

            <h3 className="mt-8">5. Implement in Phases</h3>
            <p>
              Avoid the temptation to digitize everything at once. A phased approach allows you to:
            </p>
            <ul className="my-6">
              <li className="mb-2"><strong>Test and learn</strong> before making major investments</li>
              <li className="mb-2"><strong>Adjust your approach</strong> based on early results</li>
              <li className="mb-2"><strong>Build on successes</strong> and learn from setbacks</li>
              <li><strong>Manage cash flow</strong> by spreading investments over time</li>
            </ul>

            <h3 className="mt-8">6. Measure Results and Iterate</h3>
            <p>
              Digital transformation is an ongoing journey, not a one-time project. Continuously:
            </p>
            <ul className="my-6">
              <li className="mb-2"><strong>Track key performance indicators</strong> tied to your objectives</li>
              <li className="mb-2"><strong>Gather feedback</strong> from employees and customers</li>
              <li className="mb-2"><strong>Stay informed</strong> about emerging technologies</li>
              <li><strong>Refine your approach</strong> based on what you learn</li>
            </ul>

            <h2 className="mt-10">Common Pitfalls to Avoid</h2>
            
            <div className="bg-red-50 p-6 rounded-lg my-6">
              <h3 className="text-red-800 mt-0 mb-4">Watch Out For:</h3>
              <ul className="space-y-2 my-0 text-red-700">
                <li><strong>Technology for technology's sake:</strong> Focus on business problems, not shiny new tools</li>
                <li><strong>Neglecting employee training:</strong> People need skills to use new technology effectively</li>
                <li><strong>Trying to do too much at once:</strong> Start small and build momentum</li>
                <li><strong>Underestimating resource requirements:</strong> Be realistic about time, money, and effort needed</li>
                <li><strong>Failing to measure results:</strong> Define success metrics from the start</li>
              </ul>
            </div>

            <h2 className="mt-10">Government Support for Digital SMEs in Malaysia</h2>
            <p>
              Malaysian SMEs have access to various government initiatives to support digital transformation:
            </p>
            <ul className="my-6">
              <li className="mb-2"><strong>SME Digitalization Grant:</strong> Matching grants of up to RM5,000 for digital adoption</li>
              <li className="mb-2"><strong>Digital Marketing and E-Commerce Campaign:</strong> Support for businesses to sell online</li>
              <li className="mb-2"><strong>SME Business Digital Coach:</strong> Guidance on digital transformation strategies</li>
              <li><strong>MyDIGITAL Corporation:</strong> Resources and programs under the Malaysia Digital Economy Blueprint</li>
            </ul>
            <p>
              Check with agencies like MDEC (Malaysia Digital Economy Corporation) and SME Corp for the latest programs and eligibility requirements.
            </p>

            <h2 className="mt-10">Conclusion: Start Small, Think Big</h2>
            <p>
              Digital transformation doesn't have to be overwhelming. By starting with clear objectives, focusing on high-impact initiatives, and taking a phased approach, Malaysian SMEs can successfully navigate the digital landscape.
            </p>
            <p>
              Remember that digital transformation is a journey, not a destination. The most successful businesses continuously adapt their digital strategies as technology evolves and customer expectations change.
            </p>
            <p className="text-lg font-medium text-primary">
              Ready to start your digital transformation journey? Begin with one area of your business where digital tools could make the biggest difference—like streamlining your invoicing process with Invo.
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
              <h3 className="text-2xl font-bold mb-4">Ready to start your digital transformation?</h3>
              <p className="mb-6 text-white/90 max-w-2xl mx-auto">
                Begin with your invoicing process. Invo helps Malaysian SMEs digitize their financial operations with an easy-to-use platform that ensures compliance with the latest regulations.
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