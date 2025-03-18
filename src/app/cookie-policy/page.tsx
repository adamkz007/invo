'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Cookie Policy</h1>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-4">What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your device when you visit a website. 
                They are widely used to make websites work more efficiently, as well as to provide information 
                to the owners of the site.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">How We Use Cookies</h2>
              <p>
                Invo uses cookies for various purposes, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access.</li>
                <li><strong>Analytical/Performance Cookies:</strong> These cookies allow us to recognize and count the number of visitors and to see how visitors move around our website. This helps us improve the way our website works.</li>
                <li><strong>Functionality Cookies:</strong> These cookies are used to recognize you when you return to our website. This enables us to personalize our content for you and remember your preferences.</li>
                <li><strong>Targeting Cookies:</strong> These cookies record your visit to our website, the pages you have visited, and the links you have followed. We use this information to make our website and the advertising displayed on it more relevant to your interests.</li>
              </ul>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Types of Cookies We Use</h2>
              <table className="w-full border-collapse border border-gray-300 my-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 p-2 text-left">Category</th>
                    <th className="border border-gray-300 p-2 text-left">Purpose</th>
                    <th className="border border-gray-300 p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">Session</td>
                    <td className="border border-gray-300 p-2">These cookies are temporary and are deleted when you close your browser.</td>
                    <td className="border border-gray-300 p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Persistent</td>
                    <td className="border border-gray-300 p-2">These cookies remain on your device until they expire or you delete them.</td>
                    <td className="border border-gray-300 p-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">First-Party</td>
                    <td className="border border-gray-300 p-2">These cookies are set by our website.</td>
                    <td className="border border-gray-300 p-2">Varies</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Third-Party</td>
                    <td className="border border-gray-300 p-2">These cookies are set by domains other than our website, such as Google Analytics.</td>
                    <td className="border border-gray-300 p-2">Varies</td>
                  </tr>
                </tbody>
              </table>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Specific Cookies We Use</h2>
              <table className="w-full border-collapse border border-gray-300 my-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 p-2 text-left">Cookie Name</th>
                    <th className="border border-gray-300 p-2 text-left">Purpose</th>
                    <th className="border border-gray-300 p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">invo_session</td>
                    <td className="border border-gray-300 p-2">Used to maintain user session state.</td>
                    <td className="border border-gray-300 p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">invo_auth</td>
                    <td className="border border-gray-300 p-2">Used to authenticate logged-in users.</td>
                    <td className="border border-gray-300 p-2">2 weeks</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">invo_preferences</td>
                    <td className="border border-gray-300 p-2">Stores user preferences like theme and dashboard settings.</td>
                    <td className="border border-gray-300 p-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">_ga</td>
                    <td className="border border-gray-300 p-2">Google Analytics cookie used to distinguish users.</td>
                    <td className="border border-gray-300 p-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">_gid</td>
                    <td className="border border-gray-300 p-2">Google Analytics cookie used to distinguish users.</td>
                    <td className="border border-gray-300 p-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Controlling Cookies</h2>
              <p>
                You can control and/or delete cookies as you wish. You can delete all cookies that are already 
                on your computer and you can set most browsers to prevent them from being placed. If you do this, 
                however, you may have to manually adjust some preferences every time you visit a site, and some 
                services and functionalities may not work.
              </p>
              <p>
                Most web browsers allow some control of most cookies through the browser settings. To find out 
                more about cookies, including how to see what cookies have been set and how to manage and delete 
                them, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aboutcookies.org</a> or 
                <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> allaboutcookies.org</a>.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Changes to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. We will notify you of any changes by posting 
                the new policy on this page and updating the "Last updated" date.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Contact Us</h2>
              <p>
                If you have any questions about our use of cookies, please contact us at:
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