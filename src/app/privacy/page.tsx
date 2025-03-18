'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-sm md:text-base opacity-90">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Introduction</h2>
              <p>
                At Invo, we respect your privacy and are committed to protecting your personal data. 
                This Privacy Policy explains how we collect, use, and safeguard your information when 
                you use our website and services.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, such as when you create an account, 
                use our services, or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Contact information (name, email address, phone number)</li>
                <li>Business information (company name, address, tax ID)</li>
                <li>Account credentials (username, password)</li>
                <li>Payment information (credit card details, billing address)</li>
                <li>Content you upload to our platform (invoices, client information, product details)</li>
                <li>Communications with us</li>
              </ul>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">How We Use Your Information</h2>
              <p>We use your information for various purposes, including to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Send technical notices, updates, security alerts, and support messages</li>
                <li>Communicate with you about products, services, offers, and events</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Personalize and improve your experience</li>
              </ul>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">How We Share Your Information</h2>
              <p>
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Service providers who perform services on our behalf</li>
                <li>Business partners with your consent</li>
                <li>In response to legal process or when we believe disclosure is necessary to protect our rights</li>
                <li>In connection with a business transfer (merger, acquisition, etc.)</li>
              </ul>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal 
                data against unauthorized or unlawful processing, accidental loss, destruction, or damage. 
                However, no method of transmission over the Internet or electronic storage is 100% secure, 
                so we cannot guarantee absolute security.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal data, 
                including the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your data</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@invoinvoice.com.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Cookies</h2>
              <p>
                We use cookies and similar technologies to improve your browsing experience, analyze site 
                traffic, and personalize content. You can control cookies through your browser settings. 
                For more information, please see our <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the "Last updated" date.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> privacy@invoinvoice.com<br />
                <strong>Address:</strong> Level 10, Menara XYZ, Jalan Sultan Ismail, 50250 Kuala Lumpur, Malaysia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="container mx-auto px-4 py-8 border-t">
        <Link href="/" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
} 