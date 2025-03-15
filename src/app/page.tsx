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
  ArrowRight
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
      title: "Invoice Management",
      description: "Create, send, and track professional invoices with ease. Get paid faster with automated reminders."
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Customer Management",
      description: "Maintain a comprehensive database of your customers and their transaction history."
    },
    {
      icon: <Package className="h-10 w-10 text-primary" />,
      title: "Inventory Tracking",
      description: "Keep track of your products, stock levels, and automatically update inventory when creating invoices."
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Financial Insights",
      description: "Gain valuable insights into your business performance with detailed reports and analytics."
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "Time-Saving Automation",
      description: "Automate recurring invoices, payment reminders, and inventory updates to save valuable time."
    },
    {
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: "Secure Payments",
      description: "Accept payments online directly through your invoices with our secure payment processing."
    }
  ];

  // Pricing plans
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for freelancers just getting started",
      features: [
        "Up to 5 clients",
        "Up to 10 invoices per month",
        "Basic reporting",
        "Email support"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Professional",
      price: "$12",
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
      price: "$29",
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-full bg-primary"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center text-white font-bold"
              >
                I
              </motion.div>
            </div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl font-bold"
            >
              Invo
            </motion.span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium hover:text-primary">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary">Testimonials</a>
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
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Simplify Your <span className="text-primary">Invoice Management</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
                Streamline your invoicing, manage customers, and track inventory all in one place. Get paid faster and grow your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required. Free 14-day trial.
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
                <img 
                  src="/dashboard-preview.png" 
                  alt="Invo Dashboard" 
                  className="w-full h-auto relative z-10"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.src = "https://placehold.co/600x400/4f46e5/ffffff?text=Invo+Dashboard";
                  }}
                />
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
            TRUSTED BY BUSINESSES WORLDWIDE
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5'].map((company, index) => (
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
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Everything You Need to Manage Your Business
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Invo combines all the tools you need to run your business efficiently in one simple platform.
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
                className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              How Invo Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Get started in minutes and streamline your business operations
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
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Choose the plan that works best for your business
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
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              What Our Customers Say
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Thousands of businesses trust Invo to manage their invoicing
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Invo has completely transformed how we handle our invoicing. We've reduced the time spent on billing by 75% and get paid faster than ever.",
                author: "Sarah Johnson",
                role: "Founder, Design Studio"
              },
              {
                quote: "The inventory management feature alone is worth the price. Being able to track stock levels and automatically update them when creating invoices is a game-changer.",
                author: "Michael Chen",
                role: "E-commerce Owner"
              },
              {
                quote: "As a freelancer, I needed something simple yet powerful. Invo is exactly that - it helps me look professional and keeps all my client information organized.",
                author: "Emma Rodriguez",
                role: "Independent Consultant"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-background rounded-lg p-6 shadow-sm border"
              >
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to streamline your business?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of businesses that use Invo to manage their invoicing, customers, and inventory.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-4 text-sm opacity-80">
              No credit card required. 14-day free trial.
            </p>
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
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Documentation</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Help Center</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Guides</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">API</a></li>
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
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-2">
                I
              </div>
              <span className="font-bold">Invo</span>
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
