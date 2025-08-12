'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineLoading } from '@/components/ui/loading';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-lg md:text-xl opacity-90">
              Have questions or need help? We're here for you.
            </p>
          </div>
        </div>
      </header>

      {/* Contact Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Get in Touch</h2>
                <p className="text-muted-foreground mb-8">
                  Our team is ready to answer your questions about Invo and help you get the most out of our platform.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">Email Us</h3>
                      <p className="text-muted-foreground">hello@invo.my</p>
                      <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">Call Us</h3>
                      <p className="text-muted-foreground">+60 3 1234 5678</p>
                      <p className="text-sm text-muted-foreground">Mon-Fri, 9am-6pm MYT</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">Visit Us</h3>
                      <p className="text-muted-foreground">Level 10, Menara XYZ</p>
                      <p className="text-muted-foreground">Jalan Sultan Ismail</p>
                      <p className="text-muted-foreground">50250 Kuala Lumpur, Malaysia</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12">
                  <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    {['facebook', 'twitter', 'linkedin', 'instagram'].map(platform => (
                      <a 
                        key={platform}
                        href={`https://${platform}.com`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                      >
                        <span className="text-primary capitalize">{platform.charAt(0)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="bg-card p-8 rounded-lg border shadow-sm">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Send a Message</h2>
                
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We'll get back to you as soon as possible.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      type="button"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name" 
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Your name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <input 
                          type="email" 
                          id="email" 
                          name="email" 
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                        <select 
                          id="subject" 
                          name="subject" 
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Select a subject</option>
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Sales Question">Sales Question</option>
                          <option value="Technical Support">Technical Support</option>
                          <option value="Billing Issue">Billing Issue</option>
                          <option value="Partnership">Partnership</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                        <textarea 
                          id="message" 
                          name="message" 
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="How can we help you?"
                        ></textarea>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <InlineLoading text="Sending..." /> : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              {[
                {
                  question: "How quickly can I get started with Invo?",
                  answer: "Very quickly! Sign up takes less than a minute, and you can create your first invoice immediately after. The interface is intuitive, so most users don't need any training to get started."
                },
                {
                  question: "Is my data secure with Invo?",
                  answer: "Absolutely. We use bank-level encryption to protect your data, and we never share your information with third parties without your consent. Your data security is our top priority."
                },
                {
                  question: "Can I cancel my subscription at any time?",
                  answer: "Yes, you can cancel your subscription anytime with no penalty. We don't believe in locking customers into long-term contracts."
                },
                {
                  question: "Do you offer discounts for annual billing?",
                  answer: "Yes, we offer a 20% discount for customers who choose annual billing instead of monthly billing."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-background p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold mb-2">How to Contact Support</h3>
              <p className="text-muted-foreground mb-4">Follow these simple steps to get help from our support team:</p>
              <ol className="list-decimal pl-5 space-y-1 mb-4">
                <li>Log in to your Invo account</li>
                <li>Click on the "Help" icon in the top right corner</li>
                <li>Select "Create Support Ticket" from the dropdown menu</li>
                <li>Fill out the form with details about your issue</li>
                <li>Submit your ticket and you'll receive a confirmation email</li>
              </ol>
              <p className="text-muted-foreground">Our support team typically responds within 1 business day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-primary bg-primary/10 px-2.5 py-1.5 rounded-md transition-colors hover:bg-primary/20 w-fit">
          <ArrowLeft className="h-4 w-4" />
          <LayoutDashboard className="h-4 w-4" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}