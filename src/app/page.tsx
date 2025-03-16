'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

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
      date: "Q3 2023",
      title: "Online Payment Integration",
      description: "Let customers pay you directly through invoices with credit cards and digital wallets. Get paid faster, with less hassle.",
      status: "Coming Soon"
    },
    {
      date: "Q4 2023",
      title: "Malaysia e-Invoicing Compliance",
      description: "Automatically meet Malaysia's e-Invoicing requirements with one-click submission to tax authorities. Stay compliant without the headache.",
      status: "In Development"
    },
    {
      date: "Q1 2024",
      title: "Advanced Tax Management",
      description: "Handle complex tax scenarios with ease. Perfect for businesses that operate across multiple regions or deal with various tax rates.",
      status: "Planned"
    },
    {
      date: "Q2 2024",
      title: "Integration Marketplace",
      description: "Connect Invo with your favorite business tools. Sync with accounting software, e-commerce platforms, and more.",
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
        "Up to 5 invoices per month",
        "Basic reporting"
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
        "Priority support",
        "Custom branding",
        "Team access (up to 3 users)"
      ],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "RMxx",
      period: "per month",
      description: "For established businesses with complex needs",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced security features"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-8 w-8">
              <img 
                src="/invo-logo.png" 
                alt="Invo Logo" 
                className="h-8 w-auto"
              />
            </div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl font-bold text-primary"
            >
              Invo
            </motion.span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium hover:text-primary">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary">Testimonials</a>
            <Link href="/blog" className="text-sm font-medium hover:text-primary">Blog</Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary">Login</Link>
            <Link href="/signup">
              <Button size="sm">Sign Up Free</Button>
            </Link>
          </div>
          
          <div className="md:hidden">
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary/5 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left"
            >
              <div className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full">
                <span className="text-sm font-medium text-primary">Made for Small & Medium Businesses</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Invoicing that <span className="text-primary relative">
                  works for you
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5.5C47.6667 1.5 154.4 -1.9 199 5.5" stroke="#02228F" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
                No complicated software. No accounting degree needed. Just simple, practical tools that help your business get paid faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required. 14-day free trial.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative"
            >
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 absolute inset-0"></div>
                {/* Desktop image */}
                <img 
                  src="/dashboard-preview.png" 
                  alt="Invo Dashboard" 
                  className="w-full h-auto relative z-10 hidden md:block"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.src = "https://placehold.co/600x400/02228F/ffffff?text=Invo+Dashboard";
                  }}
                />
                {/* Mobile image with frame */}
                <div className="relative mx-auto max-w-[340px] md:hidden p-0 my-0">
                  <img 
                    src="/mobile-dashboard-preview.png" 
                    alt="Invo Mobile Dashboard" 
                    className="w-full h-auto relative z-10 shadow-lg"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.currentTarget.src = "https://placehold.co/320x640/02228F/ffffff?text=Mobile+Dashboard";
                    }}
                  />
                </div>
              </div>
              
              {/* Floating elements for visual interest */}
              <div className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-primary/20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 h-8 w-8 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6">
            TRUSTED BY BUSINESSES LIKE YOURS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Local Shop', 'Service Pro', 'Creative Studio', 'Food Truck', 'Online Store'].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ opacity: 1 }}
                className="text-xl font-bold text-muted-foreground"
              >
                {company}
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
              className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full"
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
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              We&apos;ve built Invo specifically for small and medium businesses. No bloated features, just the tools you actually need.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border group hover:border-primary/50"
              >
                <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap/Timeline Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full"
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
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform md:translate-x-px hidden md:block"></div>
            
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
                    <div className="absolute left-0 md:left-1/2 w-5 h-5 rounded-full bg-primary transform -translate-x-1/2 hidden md:block"></div>
                    
                    {/* Content */}
                    <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-8 md:pl-0 border-l md:border-0 border-primary/20`}>
                      <div className="bg-card rounded-lg p-6 shadow-sm border relative">
                        <div className="absolute top-0 right-0 mt-4 mr-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            item.status === 'Coming Soon' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'In Development' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-primary mb-2">{item.date}</div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
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
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full"
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
                <div className="bg-background rounded-lg p-8 shadow-sm border relative z-10">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-primary/20 z-0 -translate-y-1/2">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
                      <ChevronRight className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/signup">
              <Button size="lg">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full"
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`rounded-lg p-8 border ${
                  plan.highlighted 
                    ? 'border-primary shadow-lg relative' 
                    : 'border-border shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
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
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.name === "Enterprise" ? "/contact" : "/signup"}>
                  <Button 
                    variant={plan.highlighted ? "default" : "outline"} 
                    className="w-full"
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
      <section id="testimonials" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full"
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
                quote: "As a small bakery owner, I needed something simple that wouldn&apos;t take hours to learn. Invo is perfect - I create invoices in seconds and my customers can pay me right away.",
                author: "Sarah Johnson",
                role: "Local Bakery Owner"
              },
              {
                quote: "The inventory tracking alone has saved me so much time. I always know what&apos;s in stock and what I need to order. It&apos;s like having an extra employee without the cost.",
                author: "Michael Chen",
                role: "Retail Shop Owner"
              },
              {
                quote: "I was spending hours each week on invoicing. Now it takes minutes. The recurring invoice feature is a game-changer for my consulting business.",
                author: "Emma Rodriguez",
                role: "Marketing Consultant"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-background rounded-lg p-6 shadow-sm border relative"
              >
                <div className="absolute -top-3 left-6 transform rotate-45 w-6 h-6 bg-background border-t border-l border-border"></div>
                <div className="mb-4 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full"
            >
              <span className="text-sm font-medium text-primary">Latest Insights</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              From Our Blog
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Helpful resources and guides to help your business succeed
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: 'malaysia-e-invoicing-changes',
                title: 'Malaysia E-Invoicing: New Changes and How They Impact SMEs',
                excerpt: 'Learn about the latest e-invoicing regulations in Malaysia and what your small business needs to do to stay compliant.',
                date: 'March 15, 2023',
                category: 'Compliance',
                image: '/blog/malaysia-e-invoicing.jpg',
                slug: 'malaysia-e-invoicing-changes'
              },
              {
                id: 'invoice-tips-small-business',
                title: '5 Invoicing Tips Every Small Business Should Know',
                excerpt: 'Improve your cash flow and get paid faster with these practical invoicing strategies for small businesses.',
                date: 'February 28, 2023',
                category: 'Tips & Tricks',
                image: '/blog/invoice-tips.jpg',
                slug: 'invoice-tips-small-business'
              },
              {
                id: 'digital-transformation-smes',
                title: 'Digital Transformation for SMEs: Where to Start',
                excerpt: 'A step-by-step guide to beginning your digital transformation journey without overwhelming your small business.',
                date: 'February 15, 2023',
                category: 'Digital Transformation',
                image: '/blog/digital-transformation.jpg',
                slug: 'digital-transformation-smes'
              }
            ].map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-background rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow group"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/600x400/02228F/ffffff?text=${encodeURIComponent(post.category)}`;
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">
                    {post.category}
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{post.date}</span>
                  </div>
                  <Link href={`/blog/posts/${post.slug}`}>
                    <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
                      Read More
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/blog">
              <Button variant="outline" size="lg">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
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
            className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to simplify your business?</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                Join thousands of small businesses that use Invo to save time, get paid faster, and look more professional.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="font-bold">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-4 text-sm opacity-80">
                No credit card required. 14-day free trial.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-primary">Pricing</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Security</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">About</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Help Center</a></li>
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Guides</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Templates</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Webinars</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/invo-logo.png" alt="Invo Logo" className="h-8 w-auto mr-2" />
              <span className="font-bold text-primary">Invo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Invo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
