import type { Metadata } from 'next';
import { BlogPostLayout } from '@/components/blog/blog-post-layout';
import { DisclaimerBox, InfoBox, TipBox, CheckList, NumberedSteps } from '@/components/blog/formatting-components';
import { getBlogPostMetadata } from '@/lib/seo';

export const metadata: Metadata = getBlogPostMetadata('malaysia-tax-filing-form-b-form-be-ya-2025');

export default function MalaysiaTaxFilingFormBFormBEPost() {
  const relatedPosts = [
    {
      id: 'tax-deductions-business-expenses',
      title: 'Tax Deductions: Business Expenses You Might Be Missing',
      excerpt: 'Discover often-missed tax deductions for Malaysian businesses and how to claim them correctly.',
      date: 'January 30, 2023',
      author: 'Adam',
      readTime: '7 min read',
      category: 'Taxes',
      image: '/blog/tax-deductions.jpg',
      slug: 'tax-deductions-business-expenses'
    },
    {
      id: 'malaysia-e-invoicing-changes',
      title: 'Malaysia E-Invoicing: New Changes and How They Impact SMEs',
      excerpt: 'Learn about the latest e-invoicing regulations in Malaysia and what your small business needs to do to stay compliant.',
      date: 'March 15, 2025',
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
      date: 'February 28, 2023',
      author: 'Adam',
      readTime: '7 min read',
      category: 'Invoicing',
      image: '/blog/invoice-tips.jpg',
      slug: 'invoice-tips-small-business'
    }
  ];

  return (
    <BlogPostLayout
      title="Malaysia SME Tax Filing 2025: Form B and Form BE, Step by Step"
      category="Taxes"
      date="March 7, 2026"
      readTime="12 min read"
      featuredImage="/blog/tax-deductions.jpg"
      imageAlt="Malaysia tax filing for SMEs"
      imageCaption="Plan your records early to make filing season smoother"
      relatedPosts={relatedPosts}
      ctaTitle="Make tax season easier with better records"
      ctaDescription="Invo helps you track income, expenses, and receipts all year so your YA 2025 filing is straightforward."
    >
      <p className="lead">
        Filing taxes as a small or medium business in Malaysia can feel overwhelming, especially when you&apos;re juggling
        daily operations. This guide breaks it down into two clear parts: Form B for business income and Form BE for
        employment-only income. It&apos;s written for YA 2025, which means income earned in 2025 and filed in 2026.
      </p>

      <DisclaimerBox>
        This article is a practical guide, not tax advice. Reliefs and rules can change, and your situation may be
        different. Always confirm details on MyTax or with a licensed tax professional.
      </DisclaimerBox>

      <h2>Quick decision: Form B vs Form BE</h2>
      <p>
        The most common mistake is picking the wrong form. Use this quick check to stay on the right track:
      </p>
      <CheckList
        items={[
          'File Form B if you have any business income (sole proprietor, freelancer, side business, or partnership share).',
          'File Form BE if you only have employment income and no business income.',
          'If you have both salary and business income, you file Form B and include everything.'
        ]}
      />

      <TipBox>
        YA 2025 refers to income earned from 1 January to 31 December 2025. Filing happens in 2026. Log in to MyTax
        early to see the official due dates for your situation.
      </TipBox>

      <h2>Part 1: Form B (business income)</h2>
      <p>
        Form B is for individuals with business income. That includes sole proprietors, partners in a partnership,
        freelancers, commission earners, and employees who run a side business.
      </p>

      <h3>What can be claimed in Form B?</h3>
      <p>
        Your goal is to report your true business profit. That means claiming allowable expenses that are
        wholly and exclusively incurred for business.
      </p>
      <ul>
        <li><strong>Revenue and cost of sales:</strong> Sales, service income, and direct costs tied to those sales.</li>
        <li><strong>Operating expenses:</strong> Rent, utilities, internet, staff salaries, software, marketing, and professional fees.</li>
        <li><strong>Vehicle and travel (business portion):</strong> Fuel, tolls, parking, and maintenance for business use.</li>
        <li><strong>Bad debts written off:</strong> If genuinely uncollectible and properly documented.</li>
        <li><strong>Capital allowances:</strong> Tax depreciation for business assets like computers, machinery, and office furniture.</li>
      </ul>

      <h3>What usually can&apos;t be claimed</h3>
      <ul>
        <li><strong>Personal expenses:</strong> Home groceries, personal phone bills, or private travel.</li>
        <li><strong>Private portion of mixed expenses:</strong> You can only claim the business portion.</li>
        <li><strong>Accounting depreciation:</strong> Use capital allowances instead of book depreciation.</li>
        <li><strong>Fines and penalties:</strong> These are not deductible.</li>
      </ul>

      <h3>How to file Form B (simple flow)</h3>
      <NumberedSteps
        steps={[
          {
            title: 'Prepare records',
            description: 'Finalize your profit and loss statement and list of expenses with receipts.'
          },
          {
            title: 'Compute adjusted income',
            description: 'Start with net profit, add back non-deductible expenses, then apply allowable deductions.'
          },
          {
            title: 'Apply capital allowances',
            description: 'Claim tax depreciation on qualifying business assets purchased or used in 2025.'
          },
          {
            title: 'Add other income',
            description: 'Include salary, interest, or other taxable income if applicable.'
          },
          {
            title: 'Claim personal reliefs',
            description: 'Apply your eligible individual reliefs before calculating tax payable.'
          },
          {
            title: 'Submit on MyTax',
            description: 'Review carefully, submit the e-Form B, and save the acknowledgement slip.'
          }
        ]}
      />

      <h3>YA 2025 resident tax rates (used for both forms)</h3>
      <p>
        Malaysia applies progressive rates for resident individuals. These rates apply to YA 2025.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Chargeable income band (RM)</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0 – 5,000</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>5,001 – 20,000</td>
              <td>1%</td>
            </tr>
            <tr>
              <td>20,001 – 35,000</td>
              <td>3%</td>
            </tr>
            <tr>
              <td>35,001 – 50,000</td>
              <td>6%</td>
            </tr>
            <tr>
              <td>50,001 – 70,000</td>
              <td>11%</td>
            </tr>
            <tr>
              <td>70,001 – 100,000</td>
              <td>19%</td>
            </tr>
            <tr>
              <td>100,001 – 400,000</td>
              <td>25%</td>
            </tr>
            <tr>
              <td>400,001 – 600,000</td>
              <td>26%</td>
            </tr>
            <tr>
              <td>600,001 – 2,000,000</td>
              <td>28%</td>
            </tr>
            <tr>
              <td>Above 2,000,000</td>
              <td>30%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <InfoBox>
        <h4 className="mt-0 mb-3">Sample calculation for Form B (simplified)</h4>
        <ul className="my-0">
          <li>Sales revenue: RM240,000</li>
          <li>Cost of sales: RM80,000</li>
          <li>Operating expenses (allowable): RM60,000</li>
          <li>Adjusted income: RM100,000</li>
          <li>Capital allowances: RM12,000</li>
          <li>Statutory income: RM88,000</li>
          <li>Other income: RM0</li>
          <li>Total income: RM88,000</li>
          <li>Total personal reliefs (example): RM28,000</li>
          <li>Chargeable income: RM60,000</li>
        </ul>
        <p className="mt-4 mb-0">
          Tax on RM60,000: RM150 (next RM15,000 at 1%) + RM450 (next RM15,000 at 3%) + RM900 (next RM15,000 at 6%) +
          RM1,100 (next RM10,000 at 11%) = <strong>RM2,600</strong>.
        </p>
      </InfoBox>

      <h2>Part 2: Form BE (employment income only)</h2>
      <p>
        Form BE is for resident individuals with only employment income. It&apos;s common for employees with no business
        income or side business.
      </p>

      <h3>What can be claimed in Form BE?</h3>
      <p>
        You don&apos;t claim business expenses here. Instead, you claim personal reliefs and rebates that reduce your
        chargeable income.
      </p>
      <ul>
        <li><strong>Individual and spouse reliefs:</strong> Basic reliefs for yourself and spouse (if applicable).</li>
        <li><strong>Children reliefs:</strong> Reliefs for dependent children, including higher reliefs for disabled children.</li>
        <li><strong>EPF and life insurance:</strong> Employee EPF and qualifying life insurance or takaful.</li>
        <li><strong>Education and upskilling:</strong> Approved education fees for yourself.</li>
        <li><strong>Lifestyle and medical:</strong> Books, devices, internet, medical expenses, and insurance.</li>
        <li><strong>SSPN and donations:</strong> Eligible education savings and approved donations.</li>
        <li><strong>Zakat and fitrah:</strong> Typically treated as rebates.</li>
      </ul>

      <h3>How to file Form BE (simple flow)</h3>
      <NumberedSteps
        steps={[
          {
            title: 'Collect Form EA',
            description: 'Get your annual income statement from your employer.'
          },
          {
            title: 'Confirm income',
            description: 'Check your EA details and ensure any other taxable income is included.'
          },
          {
            title: 'Claim reliefs',
            description: 'Enter your eligible reliefs with supporting receipts.'
          },
          {
            title: 'Review and submit',
            description: 'Submit via MyTax and keep the acknowledgement slip.'
          }
        ]}
      />

      <InfoBox>
        <h4 className="mt-0 mb-3">Sample calculation for Form BE (simplified)</h4>
        <ul className="my-0">
          <li>Employment income: RM96,000</li>
          <li>Total personal reliefs (example): RM24,000</li>
          <li>Chargeable income: RM72,000</li>
        </ul>
        <p className="mt-4 mb-0">
          Tax on RM72,000: RM150 (next RM15,000 at 1%) + RM450 (next RM15,000 at 3%) + RM900 (next RM15,000 at 6%) +
          RM2,420 (next RM22,000 at 11%) = <strong>RM3,920</strong>.
        </p>
      </InfoBox>

      <h2>Record-keeping tips that make filing easy</h2>
      <p>
        Good records do most of the heavy lifting. If your paperwork is clean, filing is just data entry.
      </p>
      <CheckList
        items={[
          'Track income and expenses monthly instead of waiting for year-end.',
          'Keep digital copies of receipts and invoices in one place.',
          'Separate personal and business transactions with a dedicated account.',
          'Review your relief receipts before filing season so there are no surprises.'
        ]}
      />

      <h2>Final word</h2>
      <p>
        Filing Form B or Form BE is easier when you know which form applies and you keep records all year. Start with
        the basics, follow the steps, and you&apos;ll avoid the last-minute rush. When in doubt, confirm details on MyTax
        or speak to a tax professional.
      </p>
    </BlogPostLayout>
  );
}
