'use client';

import Link from 'next/link';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
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
                Welcome to Invo. These Terms of Service govern your use of our website and services.
                By accessing or using Invo, you agree to be bound by these terms.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Definitions</h2>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li><strong>"We", "Us", "Our"</strong> refers to Invo.</li>
                <li><strong>"Services"</strong> refers to the Invo platform, including all features, functionalities, and user interfaces.</li>
                <li><strong>"You", "Your", "User"</strong> refers to the individual or entity using our Services.</li>
                <li><strong>"Content"</strong> refers to text, graphics, images, music, software, audio, video, information or other materials.</li>
              </ul>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Account Registration</h2>
              <p>
                To use certain features of our Services, you must register for an account. You must provide 
                accurate, current, and complete information and keep your account information updated. You 
                are responsible for safeguarding your account credentials and for all activities that occur 
                under your account.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscription and Payments</h2>
              <p>
                Some of our Services require payment of fees. All fees are stated in Malaysian Ringgit (RM) 
                unless otherwise specified. You agree to pay all applicable fees and taxes. Subscription fees 
                are billed in advance on a monthly or annual basis. Your subscription will automatically renew 
                unless you cancel it before the renewal date.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Content and Licenses</h2>
              <p>
                You retain all rights to your Content. By uploading Content to Invo, you grant us a worldwide, 
                non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, 
                transmit, display, and distribute such Content for the purpose of providing our Services to you.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Acceptable Use</h2>
              <p>
                You agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Use the Services in any way that violates any applicable law or regulation</li>
                <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Services</li>
                <li>Attempt to gain unauthorized access to any part of the Services</li>
                <li>Use the Services to send spam or other unsolicited communications</li>
                <li>Upload or transmit viruses, malware, or other types of malicious software</li>
                <li>Impersonate or misrepresent your affiliation with any person or entity</li>
              </ul>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Services at our sole discretion, 
                without prior notice, for any reason, including if you violate these Terms. Upon termination, 
                your right to use the Services will immediately cease.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Disclaimer of Warranties</h2>
              <p>
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF 
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL INVO BE LIABLE FOR ANY INDIRECT, 
                PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER INCLUDING, 
                WITHOUT LIMITATION, DAMAGES FOR LOSS OF USE, DATA OR PROFITS, ARISING OUT OF OR IN ANY WAY 
                CONNECTED WITH THE USE OR PERFORMANCE OF THE SERVICES.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Malaysia, 
                without regard to its conflict of law provisions.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will notify you of any changes by posting the new 
                Terms on this page and updating the "Last updated" date. Your continued use of the Services 
                after any such changes constitutes your acceptance of the new Terms.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> hello@invo.my<br />
                <strong>Address:</strong> Kuala Lumpur, Malaysia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="container mx-auto px-4 py-8 border-t">
        <Link href="/" className="inline-flex items-center gap-1.5 text-primary bg-primary/10 px-2.5 py-1.5 rounded-md transition-colors hover:bg-primary/20 w-fit">
          <ArrowLeft className="h-4 w-4" />
          <LayoutDashboard className="h-4 w-4" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}