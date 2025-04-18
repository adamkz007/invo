'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerWithRelations } from '@/types';

export default function NewCustomerPage() {
  const router = useRouter();
  
  // Handle customer creation
  const handleCustomerCreated = (customer: CustomerWithRelations) => {
    // Redirect to customers page after creation
    setTimeout(() => {
      router.push('/customers');
      router.refresh();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link 
          href="/customers" 
          className="mr-4 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to customers
        </Link>
        <h1 className="text-3xl font-bold">Create New Customer</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>
            Add a new customer to your business contacts. Only Name and Phone Number are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Import and render the dialog form directly */}
          <div className="w-full max-w-md mx-auto">
            {/* Using dynamic import to avoid hydration issues */}
            <CustomerForm userId="1" onCustomerCreated={handleCustomerCreated} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// This is a client component that renders the form from the dialog component
// but without the dialog wrapper
function CustomerForm({ userId, onCustomerCreated }: { userId: string, onCustomerCreated: (customer: any) => void }) {
  // Use dynamic import to load the component client-side
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  
  useEffect(() => {
    import('@/components/customers/customer-form-dialog').then(mod => {
      // Create a wrapper component that renders just the form part
      const WrappedComponent = (props: any) => {
        const DialogContent = mod.default;
        // Render with special prop to tell the component to render without dialog
        return <DialogContent {...props} renderWithoutDialog={true} />;
      };
      setComponent(() => WrappedComponent);
    });
  }, []);
  
  if (!Component) return <div>Loading form...</div>;
  
  return <Component userId={userId} onCustomerCreated={onCustomerCreated} />;
}
