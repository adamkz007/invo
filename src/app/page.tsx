'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dashboardImage from '../../public/dash.png';
import { 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  Clock, 
  CreditCard, 
  Shield, 
  ChevronRight, 
  Check,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dashboardImageError, setDashboardImageError] = useState(false);

  // Add theme hook to detect dark mode
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Handle scroll event for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Features section data
  const features = [
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Simple Invoicing",
      description: "Create professional invoices in seconds with templates designed for small businesses. No accounting degree needed!"
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Customer Relationships",
      description: "Keep track of all your clients in one place. Send personalized messages and build lasting business relationships."
    },
    {
      icon: <Package className="h-10 w-10 text-primary" />,
      title: "Smart Inventory",
      description: "Never run out of stock again. Get alerts when inventory is low and track what's selling best for your business."
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Business Insights",
      description: "See how your business is performing with easy-to-understand charts. Make smarter decisions with real data."
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "Time-Saving Tools",
      description: "Set up recurring invoices and automated reminders. Spend less time on paperwork and more time growing your business."
    },
    {
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: "Work Anywhere",
      description: "Access your business from your phone, tablet, or computer. Keep things running smoothly whether you&apos;re in the office or on the go."
    }
  ];

  // Timeline data for future releases
  const timelineItems = [
    {
      date: "Q2 2025",
      title: "Receipts",
      description: "Issue receipts in seconds for cash payments. Store it forever.",
      status: "Coming Soon"
    },
    {
      date: "Q3 2025",
      title: "Malaysia e-Invoicing Compliance",
      description: "Automatically meet Malaysia's e-Invoicing requirements with one-click submission to MyInvois Portal. Stay compliant without the headache.",
      status: "In Development"
    },
    {
      date: "Q4 2025",
      title: "Customer Loyalty",
      description: "Engage your top-spending customers like never before, with personalized offers and exclusive rewards.",
      status: "Planned"
    },
    {
      date: "Q1 2026",
      title: "API & Integration",
      description: "Connect Invo with your favorite business tools. Sync with POS, accounting software, e-commerce, and more.",
      status: "Planned"
    }
  ];

  // Pricing plans
  const plans = [
    {
      name: "Basic",
      price: "RM0",
      period: "forever",
      description: "Perfect for micro SMEs",
      features: [
        "Up to 5 clients",
        "Up to 15 invoices per month",
        "Partial payments, taxes, and discounts"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Premium",
      price: "RM9",
      period: "per month",
      description: "Ideal for growing businesses",
      features: [
        "Unlimited clients",
        "Unlimited invoices",
        "Advanced reporting",
        "Custom logo & branding"
      ],
      cta: "Start Free Trial",
      highlighted: true
    }
  ];

  // Blog posts
  const featuredPosts = [
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
      {/* Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md shadow-md border-b border-border/50' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-8 w-8">
              <Image 
                src={isDarkMode ? "/invo-logo-w.png" : "/invo-logo.png"} 
                alt="Invo Logo" 
                width={32}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : isScrolled ? 'text-foreground' : 'text-primary'}`}>Invo</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonials</a>
            <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">Blog</Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
            <Link href="/signup">
              <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">Sign Up Free</Button>
            </Link>
          </div>
          
          <div className="md:hidden">
            <Link href="/signup">
              <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/10 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-primary/15 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left"
            >
              <div className="inline-block mb-4 px-4 py-1.5 bg-primary/15 rounded-full shadow-sm">
                <span className="text-sm font-medium text-primary">Made for Malaysian freelancers & SMEs</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Invoicing that <span className="text-primary relative">
                  works for you
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5.5C47.6667 1.5 154.4 -1.9 199 5.5" stroke="#02228F" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
                No complicated software. Just practical tools that help your business get paid faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
                    Start for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary/30 hover:border-primary/50 shadow-sm hover:shadow-md transition-all">
                    See How It Works
                  </Button>
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground line-through">
                No credit card required. 14-day free trial.
              </p>
              <p className="mt-2 text-sm font-medium bg-green-100/50 text-green-800 px-4 py-1.5 rounded-full inline-block shadow-sm border border-green-200/50">
                We're in beta! Enjoy all features free for a limited time
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative"
            >
              <div className="relative rounded-xl overflow-hidden shadow-xl border border-primary/20">
                <div className="bg-gradient-to-br from-primary/15 to-primary/5 absolute inset-0"></div>
                {/* Desktop image */}
                <div className="hidden md:block relative z-10">
                  <Image 
                    src={dashboardImage}
                    alt="Invo Dashboard" 
                    className="w-full h-auto"
                    priority
                  />
                </div>
                {/* Mobile image with frame */}
                <div className="relative mx-auto max-w-[340px] md:hidden p-0 my-0">
                  <Image 
                    src="/mobile-dashboard-preview.png" 
                    alt="Invo Mobile Dashboard" 
                    width={340}
                    height={650}
                    className="w-full h-auto relative z-10 shadow-lg"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.currentTarget.src = "https://placehold.co/340x650/02228F/ffffff?text=Invo+Mobile";
                    }}
                  />
                </div>
              </div>
              
              {/* Floating elements for visual interest */}
              <div className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-primary/30 animate-pulse shadow-md"></div>
              <div className="absolute -bottom-4 -left-4 h-8 w-8 rounded-full bg-primary/40 animate-pulse shadow-md" style={{ animationDelay: '1s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 md:py-16 bg-muted/40 border-y border-muted/60">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-muted-foreground mb-10">
            TRUSTED BY BUSINESSES LIKE YOURS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 max-w-5xl mx-auto">
            <motion.div
              key="yspoa"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0 * 0.1, duration: 0.5 }}
              whileHover={{ opacity: 1 }}
              className="group"
            >
              <div className="p-4 bg-white/50 rounded-xl shadow-sm border border-muted/40 group-hover:border-primary/30 group-hover:shadow-md transition-all">
                <Image 
                  src="/logos/yspoa.jpg" 
                  alt="YSPOA" 
                  width={100} 
                  height={50} 
                  className="object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                />
              </div>
            </motion.div>
            {['Service Pro', 'Creative Studio', 'Food Truck', 'Online Store'].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: (index + 1) * 0.1, duration: 0.5 }}
                whileHover={{ opacity: 1 }}
                className="text-xl font-bold text-muted-foreground group-hover:text-foreground transition-colors group"
              >
                <div className="p-4 bg-white/50 rounded-xl shadow-sm border border-muted/40 group-hover:border-primary/30 group-hover:shadow-md transition-all">
                  {company}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-1.5 bg-primary/15 rounded-full shadow-sm"
            >
              <span className="text-sm font-medium text-primary">Practical Tools for Real Businesses</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Everything You Need, Nothing You Don&apos;t
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12"
            >
              We&apos;ve built Invo specifically for Malaysian SMEs. You can ditch your paper invoices, and get started in seconds.
            </motion.p>
          </div>
          
          {/* Featured Card - Simple Invoicing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 rounded-xl overflow-hidden shadow-xl border border-primary/40"
          >
            <div className="bg-gradient-to-r from-primary/25 to-primary/10 p-8 md:p-12 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-15">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
              </div>
              {/* Circular Gradient */}
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/30 blur-3xl"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                  <div className="p-3 bg-white rounded-full w-fit mb-6 shadow-md border border-primary/20">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Simple Invoicing</h3>
                  <p className="text-foreground mb-6">
                    Create professional invoices in seconds with templates designed for small businesses. No accounting degree needed!
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start text-sm">
                      <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="font-medium">Create invoices in seconds</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="font-medium">Automated numbering and dating</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="font-medium">Send via email or generate PDFs</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="font-medium">Support partial payments, discounts, and taxes</span>
                    </li>
                  </ul>
                  <Link href="/signup">
                    <Button className="group bg-white text-primary hover:bg-primary hover:text-white shadow-md hover:shadow-lg transition-all">
                      Try Simple Invoicing
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                
                {/* Invoice example - now visible on both mobile and desktop */}
                <div className="relative">
                  <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/20 blur-xl hidden md:block"></div>
                  {/* Stacked background card */}
                  <div className="absolute top-6 left-6 w-full h-full rounded-lg bg-white/70 shadow-lg border border-primary/20 z-0 scale-95"></div>
                  {/* Main invoice card */}
                  <div className="rounded-lg bg-white/90 backdrop-blur-sm p-6 shadow-xl border border-primary/30 relative z-10 mt-8 md:mt-0">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-primary/20">
                      <div>
                        <h4 className="font-bold">Invoice #INV-2023-001</h4>
                        <p className="text-sm text-muted-foreground">Due: Mar 15, 2025</p>
                      </div>
                      <div className="bg-primary/15 text-primary rounded-full px-3 py-1.5 text-xs font-medium border border-primary/20 shadow-sm">
                        Pending
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between p-2 hover:bg-muted/10 rounded-md transition-colors">
                        <span className="text-muted-foreground">Catering - Hi-Tea Package 250pax</span>
                        <span className="font-medium">RM2,500.00</span>
                      </div>
                      <div className="flex justify-between p-2 hover:bg-muted/10 rounded-md transition-colors">
                        <span className="text-muted-foreground">Delivery - Lorry</span>
                        <span className="font-medium">RM350.00</span>
                      </div>
                      <div className="flex justify-between p-2 hover:bg-muted/10 rounded-md transition-colors">
                        <span className="text-muted-foreground">Tents & Equipments</span>
                        <span className="font-medium">RM550.00</span>
                      </div>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-primary/20 font-bold bg-muted/10 p-2 rounded-md">
                      <span>Total</span>
                      <span>RM3,500.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Other Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Customer Relationships */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-card rounded-lg p-6 shadow-md border group hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Customer Relationships</h3>
              <p className="text-muted-foreground mb-4">
                Keep track of all your clients in one place. Send personalized messages and build lasting business relationships.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Customer profiles with purchase history</span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Instantly search for customers by name, phone, or email</span>
                </li>
              </ul>
            </motion.div>

            {/* Business Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-card rounded-lg p-6 shadow-md border group hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Business Insights</h3>
              <p className="text-muted-foreground mb-4">
                See how your business is performing with easy-to-understand charts. Make smarter decisions with real data.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Visual dashboards and reporting</span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Inventory and revenue tracking</span>
                </li>
              </ul>
            </motion.div>

            {/* Time-Saving Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-card rounded-lg p-6 shadow-md border group hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Time-Saving Tools</h3>
              <p className="text-muted-foreground mb-4">
                Set up recurring invoices and automated reminders. Spend less time on paperwork and more time growing your business.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Automated inventory update</span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Invoice statuses and tracking</span>
                </li>
              </ul>
            </motion.div>
            
            {/* Work Anywhere */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-card rounded-lg p-6 shadow-md border group hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Work Anywhere</h3>
              <p className="text-muted-foreground mb-4">
                Access your invoices & finances entirely from your phone. Keep things running smoothly whether you&apos;re in the office or on the go.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Mobile-friendly interface</span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Cloud-based data syncing</span>
                </li>
              </ul>
            </motion.div>
            
            {/* Try It Free Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6 shadow-md border border-primary/30 flex flex-col items-center justify-center text-center"
            >
              <div className="mb-4 p-3 bg-white rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Try It Risk-Free</h3>
              <p className="text-muted-foreground mb-6">
                Get started with a 14-day free trial. No credit card required. Cancel anytime.
              </p>
              <Link href="/signup">
                <Button size="lg" className="group">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap/Timeline Section */}
      <section id="timeline" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-5 py-1.5 bg-primary/15 rounded-full shadow-sm border border-primary/20"
            >
              <span className="text-sm font-medium text-primary">Always Improving</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              What&apos;s Coming Next
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              We&apos;re constantly adding new features based on what our customers need
            </motion.p>
          </div>
          
          <div className="relative">
            {/* Vertical line for timeline */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-primary/30 transform md:translate-x-px hidden md:block"></div>
            
            <div className="space-y-12">
              {timelineItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  <div className={`md:flex items-center ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                    {/* Timeline dot */}
                    <div className="absolute left-0 md:left-1/2 w-6 h-6 rounded-full bg-primary shadow-md border-2 border-white transform -translate-x-1/2 hidden md:block"></div>
                    
                    {/* Content */}
                    <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-8 md:pl-0 border-l md:border-0 border-primary/30`}>
                      <div className="bg-white rounded-lg p-6 shadow-lg border border-primary/20 relative hover:shadow-xl transition-all hover:border-primary/30">
                        <div className="absolute top-0 right-0 mt-4 mr-4">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border ${
                            item.status === 'Coming Soon' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            item.status === 'In Development' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-primary mb-2 bg-primary/10 inline-block px-3 py-1 rounded-md">{item.date}</div>
                        <h3 className="text-xl font-bold mb-3 border-b border-primary/10 pb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-5 py-1.5 bg-primary/15 rounded-full shadow-sm border border-primary/20"
            >
              <span className="text-sm font-medium text-primary">Quick Setup</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Up and Running in Minutes
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              No complicated setup or training needed. Start using Invo right away.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create an Account",
                description: "Sign up for free and set up your business profile in minutes."
              },
              {
                step: "2",
                title: "Add Your Products & Customers",
                description: "Import your existing data or add new products and customers."
              },
              {
                step: "3",
                title: "Start Creating Invoices",
                description: "Generate professional invoices and get paid faster."
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="relative"
              >
                <div className="bg-white rounded-lg p-8 shadow-lg border border-primary/20 relative z-10 hover:shadow-xl transition-all hover:border-primary/30 group">
                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/15 text-primary font-bold text-lg mb-5 shadow-sm border border-primary/20 group-hover:bg-primary/25 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 border-b border-primary/10 pb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-1 bg-primary/30 z-0 -translate-y-1/2">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-1 shadow-md border border-primary/20">
                      <ChevronRight className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link href="/signup">
              <Button size="lg" className="shadow-md hover:shadow-lg transition-all px-8 py-6 text-base">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30 border-y border-border/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-5 py-2 bg-primary/15 rounded-full shadow-sm border border-primary/20"
            >
              <span className="text-sm font-medium text-primary">Affordable Plans</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Pricing That Makes Sense
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Plans that grow with your business, starting with a free option
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`rounded-xl p-8 border bg-background/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${
                  plan.highlighted 
                    ? 'border-primary shadow-lg relative hover:border-primary/80' 
                    : 'border-border/60 shadow-md hover:border-primary/30'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md border border-primary/20">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start bg-muted/40 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-3 mt-0.5" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.name === "Enterprise" ? "/contact" : "/signup"}>
                  <Button 
                    variant={plan.highlighted ? "default" : "outline"} 
                    className={`w-full font-medium text-base transition-all duration-300 ${plan.highlighted ? 'shadow-md hover:shadow-lg' : 'hover:border-primary/50 hover:text-primary'}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/50 border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-5 py-2 bg-primary/15 rounded-full shadow-sm border border-primary/20"
            >
              <span className="text-sm font-medium text-primary">Real Stories</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              From Businesses Like Yours
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              See how other small businesses are using Invo to simplify their invoicing
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "The interface is very intuitive and easy to use. Nice!",
                author: "Harith Azdi",
                role: "Operations, YSPOA"
              },
              {
                quote: "The inventory tracking alone has saved me so much time. I always know what's in stock and what I need to order. It's like having an extra employee without the cost.",
                author: "Michael",
                role: "Retail Shop Owner"
              },
              {
                quote: "I was spending hours each week on invoicing. Now it takes minutes!",
                author: "Emma",
                role: "Marketing Consultant"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-background/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-border/60 relative hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute -top-3 left-6 transform rotate-45 w-6 h-6 bg-background border-t border-l border-border shadow-sm"></div>
                <div className="mb-4 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-lg">★</span>
                  ))}
                </div>
                <p className="mb-6 italic font-medium">"{testimonial.quote}"</p>
                <div className="border-t border-border/40 pt-4">
                  <p className="font-bold text-primary">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section id="blog" className="py-20 bg-muted/30 border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-5 py-2 bg-primary/15 rounded-full shadow-sm border border-primary/20">
              <span className="text-sm font-medium text-primary">Latest Updates</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from Our Blog</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tips, insights and resources to help you manage your business finances better
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPosts.map((post, index) => (
              <Link 
                key={index}
                href={`/blog/posts/${post.slug}`}
                className="group bg-background/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-border/40 hover:border-primary/30"
              >
                <div className="h-48 overflow-hidden rounded-t-xl">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/600x400/02228F/ffffff?text=${encodeURIComponent(post.category)}`;
                    }}
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-auto">
                  <div className="inline-block px-3 py-1.5 bg-primary/15 text-primary rounded-full text-xs font-medium mb-3 shadow-sm border border-primary/20">
                    {post.category}
                  </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 mb-1">
                    {post.excerpt}
                  </p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/40">
                    <div className="flex items-center text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{post.date}</span>
                  </div>
                    <div className="text-primary font-medium text-sm flex items-center group-hover:translate-x-1.5 transition-transform duration-300">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all duration-300" />
                </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/blog">
              <Button variant="outline" size="lg" className="shadow-sm hover:shadow-md hover:border-primary/50 hover:text-primary transition-all duration-300">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4 group-hover:ml-3 transition-all duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-primary text-primary-foreground rounded-xl p-8 md:p-12 text-center relative overflow-hidden shadow-xl border border-primary/30"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to simplify your business?</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                Join thousands of small businesses that use Invo to save time, get paid faster, and look more professional.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="font-bold shadow-md hover:shadow-lg transition-all duration-300 border border-white/20">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:ml-3 transition-all duration-300" />
                </Button>
              </Link>
              <p className="mt-4 text-sm opacity-80 line-through">
                No credit card required. 14-day free trial.
              </p>
              <p className="mt-2 text-sm font-medium bg-white/20 rounded-full px-4 py-1.5 inline-block shadow-md border border-white/10">
                We're in beta! Enjoy all features free for a limited time
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 pb-6 bg-muted/70 border-t border-border/40">
        <div className="container mx-auto px-8 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-bold mb-3 text-base border-b border-border/40 pb-1">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Features</a></li>
                <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Pricing</a></li>
                <li><a href="#timeline" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-base border-b border-border/40 pb-1">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">About</Link></li>
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Blog</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Contact</Link></li>
                <li><Link href="/changelog" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-base border-b border-border/40 pb-1">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Privacy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Terms</Link></li>
                <li><Link href="/cookie-policy" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/40 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0 bg-background/60 px-4 py-1.5 rounded-full shadow-sm border border-border/30 hover:shadow-md transition-all duration-300">
              <Image src={isDarkMode ? "/invo-logo-w.png" : "/invo-logo.png"} alt="Invo Logo" width={32} height={32} className="h-7 w-auto mr-2" />
              <span className={`font-bold ${isDarkMode ? "text-white" : "text-primary"}`}>Invo</span>
            </div>
            <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full">
              © {new Date().getFullYear()} Invo. Created by Halogen Services (002897568-V)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
