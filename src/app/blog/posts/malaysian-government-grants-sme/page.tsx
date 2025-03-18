'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import Image from 'next/image';
import { ArticleFooter } from '@/components/blog/article-footer';
import { ArticleContent, Checklist, Highlight, HighlightBox } from '@/components/blog/article-content';

export default function MalaysianGovernmentGrantsSMEPost() {
  // Define related posts
  const relatedPosts = [
    {
      id: 'export-import-opportunities-malaysian-smes',
      title: 'Export & Import Opportunities for Malaysian SMEs: Your Gateway to Global Markets',
      excerpt: 'Learn about Malaysia\'s strategic advantages, high-potential export products, and step-by-step guidance to help your business expand into international markets.',
      date: 'June 12, 2023',
      author: 'Adam',
      readTime: '12 min read',
      category: 'International Trade',
      image: '/blog/export-import.jpg',
      slug: 'export-import-opportunities-malaysian-smes'
    },
    {
      id: 'inventory-management-retail',
      title: 'Smart Inventory Management for Malaysian Retail Businesses',
      excerpt: 'Learn how effective inventory management can reduce costs and improve customer satisfaction for Malaysian retailers.',
      date: 'April 10, 2023',
      author: 'Adam',
      readTime: '8 min read',
      category: 'Inventory Management',
      image: '/blog/inventory-management.jpg',
      slug: 'inventory-management-retail'
    },
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
    }
  ];

  // Author information
  const author = {
    role: 'Grant Specialist'
  };

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
              Financing
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Complete Guide to Malaysian Government Grants for SMEs in 2023
            </h1>
            <div className="flex flex-wrap items-center text-sm text-white/80">
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>May 5, 2023</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <User className="h-4 w-4 mr-1" />
                <span>Adam</span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>10 min read</span>
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
                src="/blog/government-grants.jpg"
                alt="Malaysian Government Grants for SMEs"
                width={1200}
                height={630}
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/1200x630/02228F/ffffff?text=Government+Grants";
                }}
              />
            </figure>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <ArticleContent>
            <p className="lead">
              Small and Medium Enterprises (SMEs) are the backbone of Malaysia's economy, constituting 97.4% of all business establishments and contributing significantly to employment and GDP. Recognizing this importance, the Malaysian government has established numerous grants and funding programs to help SMEs grow, innovate, and compete in the global market.
            </p>

            <p>
              This guide explores the major government grants available to Malaysian SMEs in 2023, with detailed information on eligibility requirements, application processes, and tips for successful applications.
            </p>

            <h2>Major Government Grants for Malaysian SMEs</h2>
            
            <h3>1. SME Digitalization Grant</h3>
            
            <p>
              As part of the Malaysia Digital Economy Blueprint, the government is providing RM100 million worth of grants to help SMEs embrace digital technologies.
            </p>
            
            <h4>Key Features:</h4>
            <ul>
              <li>50% matching grant of up to RM5,000 per company</li>
              <li>Covers expenses related to digital marketing, ERP systems, e-commerce integration, POS systems, and procurement of digital hardware/software</li>
              <li>Implemented through Malaysia Digital Economy Corporation (MDEC) and Bank Simpanan Nasional (BSN)</li>
            </ul>
            
            <h4>Eligibility Requirements:</h4>
            <ul>
              <li>At least 60% Malaysian ownership</li>
              <li>Annual sales turnover not exceeding RM50 million OR full-time employees not exceeding 200</li>
              <li>In operation for at least one year</li>
              <li>Business registration with SSM (Companies Commission of Malaysia)</li>
            </ul>
            
            <h4>Application Process:</h4>
            <p>
              Applications can be submitted through the official <a href="https://mdec.my/sme-digitalization-grant/" target="_blank" rel="noopener noreferrer">MDEC website</a> or through partner banks. The process involves:
            </p>
            <ol>
              <li>Online registration and submission of required documents</li>
              <li>Preliminary assessment by MDEC</li>
              <li>Final approval and disbursement of funds</li>
            </ol>
            
            <h3>2. Market Development Grant (MDG)</h3>
            
            <p>
              Administered by the Malaysia External Trade Development Corporation (MATRADE), the MDG aims to assist SMEs in expanding their export markets.
            </p>
            
            <h4>Key Features:</h4>
            <ul>
              <li>Reimbursable grant of up to RM15,000 per company per year (for most activities)</li>
              <li>Covers expenses for international trade fairs, export promotion missions, virtual exhibitions, and international e-commerce platforms</li>
              <li>Additional allocation for companies venturing into new markets</li>
            </ul>
            
            <HighlightBox>
              <h4 className="mt-0">MDG Grant Highlights</h4>
              <p>The Market Development Grant offers multiple benefits to export-oriented businesses:</p>
              <Checklist items={[
                "Financial support for international market expansion",
                "Reimbursement for participation in global trade exhibitions",
                "Funding for virtual international marketing activities",
                "Support for setting up on international e-commerce platforms",
                "Assistance with international certification costs",
                "Help with market research and feasibility studies"
              ]} />
            </HighlightBox>
            
            <h3>3. PENJANA SME Financing (PSF)</h3>
            
            <p>
              Although technically a financing scheme rather than a grant, PSF offers favorable terms that make it accessible to many SMEs that might struggle with traditional bank financing.
            </p>
            
            <h4>Key Features:</h4>
            <ul>
              <li>Financing up to RM500,000 per SME</li>
              <li>Interest rate capped at 3.5% per annum</li>
              <li>No collateral required</li>
              <li>Repayment tenure of up to 7 years</li>
              <li>Moratorium on principal repayment for the first 6 months</li>
            </ul>
            
            <h4>Eligibility Requirements:</h4>
            <ul>
              <li>At least 51% Malaysian ownership</li>
              <li>Registered with SSM</li>
              <li>In operation for at least 1 year</li>
              <li>Adversely impacted by COVID-19</li>
            </ul>

            <h2>Tips for Successful Grant Applications</h2>
            
            <p>
              Based on our experience working with Malaysian SMEs, here are some tips to increase your chances of securing government grants:
            </p>
            
            <h3>1. Thoroughly Research and Understand the Grant</h3>
            <p>
              Each grant has specific objectives and requirements. Take time to fully understand what the grant aims to achieve and how your business aligns with those goals. This understanding should be clearly reflected in your application.
            </p>
            
            <h3>2. Prepare a Comprehensive Business Plan</h3>
            <p>
              Most grants require a detailed business plan that outlines how the funds will be used and the expected outcomes. Your plan should include:
            </p>
            <ul>
              <li>Clear business objectives</li>
              <li>Detailed implementation timeline</li>
              <li>Specific, measurable outcomes</li>
              <li>Financial projections</li>
              <li>Risk assessment and mitigation strategies</li>
            </ul>
            
            <h3>3. Demonstrate Financial Capability</h3>
            <p>
              For matching grants, you need to show that you have the financial resources to cover your portion of the project cost. Prepare up-to-date financial statements and cash flow projections.
            </p>
            
            <Highlight>
              The key to a successful grant application is alignment between your business goals and the grant's objectives, combined with meticulous preparation and documentation.
            </Highlight>

            <h2>Common Challenges and How to Overcome Them</h2>
            
            <h3>1. Complex Application Processes</h3>
            <p>
              <strong>Challenge:</strong> Many SMEs find the application process bureaucratic and time-consuming.
            </p>
            <p>
              <strong>Solution:</strong> Start early, create a checklist of requirements, and assign a dedicated team member to manage the application process. Attend briefings or workshops organized by the relevant agencies.
            </p>
            
            <h3>2. Meeting Matching Fund Requirements</h3>
            <p>
              <strong>Challenge:</strong> Finding funds to match the grant amount can be difficult for cash-strapped SMEs.
            </p>
            <p>
              <strong>Solution:</strong> Consider alternative financing options such as angel investors, crowdfunding, or SME-specific loans to meet your matching requirements.
            </p>
            
            <h2>Conclusion</h2>
            
            <p>
              Government grants can provide valuable financial support for Malaysian SMEs looking to grow and innovate. By understanding the available options, preparing thoroughly, and submitting compelling applications, businesses can increase their chances of securing this crucial funding.
            </p>
            
            <p>
              Remember that grants are competitive, and not all applications will be successful. If your application is rejected, seek feedback, refine your approach, and consider alternative grants or financing options.
            </p>
            
            <p>
              The landscape of government support for SMEs continues to evolve, so stay updated through official websites, industry associations, and business chambers. With persistence and the right approach, your business can leverage these opportunities to achieve sustainable growth.
            </p>
          </ArticleContent>

          <ArticleFooter 
            author={author}
            relatedPosts={relatedPosts}
            ctaTitle="Ready to secure funding for your business?"
            ctaDescription="Invo helps Malaysian SMEs manage their finances and prepare grant applications with professional documentation. Get started today and improve your chances of securing government funding."
          />
        </div>
      </main>
    </div>
  );
} 