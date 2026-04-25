import type { Metadata } from 'next';
import { BlogPostLayout } from '@/components/blog/blog-post-layout';
import { CaptionedImage } from '@/components/ui/captioned-image';
import { DisclaimerBox, InfoBox, TipBox, NumberedSteps } from '@/components/blog/formatting-components';
import { ArticleSchema } from '@/components/seo/structured-data';
import { getBlogPostMetadata } from '@/lib/seo';

export const metadata: Metadata = getBlogPostMetadata('tax-deductions-business-expenses');

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
    <>
      <BlogPostLayout
        title="Tax Deductions: Business Expenses You Might Be Missing"
        category="Taxes"
        date="January 30, 2023"
        readTime="7 min read"
        featuredImage="/blog/tax-deductions.jpg"
        imageAlt="Tax Deductions for Business Expenses"
        imageCaption="Lobby at Doubletree by Hilton, Putrajaya Lakeside"
        relatedPosts={relatedPosts}
        ctaTitle="Ready to Maximize Your Tax Deductions?"
        ctaDescription="Let our invoice management system help you track and organize all your business expenses for maximum tax savings."
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

            <DisclaimerBox>
              While this article provides general information about tax deductions in Malaysia, tax laws change frequently. Always consult with a qualified tax professional for advice specific to your business situation.
            </DisclaimerBox>

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
            
            <InfoBox>
              <h4 className="mt-0 mb-3">Calculation Example</h4>
              <p>
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
            </InfoBox>

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
            
            <TipBox>
              Keep a detailed log of all business travel, including dates, destinations, purpose, and mileage. Use apps like Invo to capture and categorize receipts immediately to ensure nothing is missed.
            </TipBox>

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
            
            <TipBox>
              Interest on loans used for both personal and business purposes must be allocated proportionally. Only the business portion is deductible.
            </TipBox>

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
            <h3 className="mt-8">Tips for Proper Documentation</h3>
            
            <NumberedSteps 
              steps={[
                {
                  title: "Separate business and personal expenses",
                  description: "Maintain dedicated business accounts and credit cards"
                },
                {
                  title: "Digitize receipts immediately",
                  description: "Use apps like Invo to capture and categorize receipts before they're lost"
                },
                {
                  title: "Record business purpose",
                  description: "Note the business reason for each expense (client name, business discussion, etc.)"
                },
                {
                  title: "Maintain organized records",
                  description: "Keep supporting documents for at least 7 years (LHDN requirement)"
                }
              ]}
            />

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
      </BlogPostLayout>

      <ArticleSchema 
        post={{
          title: "Tax Deductions: Business Expenses You Might Be Missing",
          excerpt: "Discover often-missed tax deductions for Malaysian businesses. Learn about home office, professional development, vehicle, technology, and insurance deductions that could save thousands.",
          featuredImage: "https://invo.my/blog/tax-deductions.jpg",
          slug: "tax-deductions-business-expenses",
          publishedAt: "2023-01-30T00:00:00.000Z",
          updatedAt: "2023-01-30T00:00:00.000Z",
          author: {
            name: "Adam",
            title: "Founder",
            bio: "Adam consults for both large organizations and SMEs to identify & optimize finance processes."
          },
          category: "Taxes",
          tags: ['tax deductions', 'business expenses', 'Malaysia tax', 'LHDN', 'SME tax savings'],
          wordCount: 2500,
          readTime: 7
        }}
      />
    </>
  );
}
