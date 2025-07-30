'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, MoreHorizontal, Search, Filter, FileText, Mail, Phone, Edit, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatRelativeDate } from '@/lib/utils';
import { CustomerWithRelations } from '@/types';
import { useToast } from '@/components/ui/toast';
import { CustomerDetailDialog } from '@/components/customers/customer-detail-dialog';
import { PLAN_LIMITS } from '@/lib/stripe';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithRelations[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [userSubscription, setUserSubscription] = useState<string>('FREE');
  const router = useRouter();
  const { showToast } = useToast();
  
  // Fetch user subscription status from API
  useEffect(() => {
    async function fetchUserSubscription() {
      try {
        const response = await fetch('/api/user/me', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserSubscription(data.subscriptionStatus || 'FREE');
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    }
    
    fetchUserSubscription();
  }, []);
  
  // Fetch customers from API
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/customers', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        showToast({
          message: 'Failed to load customers. Please try again.',
          variant: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCustomers();
  }, [showToast]);

  // Handle customer deletion
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      
      // Remove the deleted customer from the state
      setCustomers(customers.filter(customer => customer.id !== customerId));
      
      showToast({
        message: 'Customer deleted successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error('Error deleting customer:', err);
      showToast({
        message: 'Failed to delete customer. Please try again.',
        variant: 'error',
      });
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsDetailDialogOpen(true);
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (customer.phoneNumber || '').includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-medium">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 shadow-sm">
          <p className="text-red-500 mb-4 font-medium">Error: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 hover:bg-red-600 transition-colors duration-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          {userSubscription === 'FREE' && (
            <p className="text-muted-foreground mt-1 flex items-center">
              <span className="inline-flex items-center">
                Used <span className="font-medium mx-1">{customers.length}</span> of <span className="font-medium mx-1">{PLAN_LIMITS.FREE.customers}</span> customers
              </span>
              {customers.length >= PLAN_LIMITS.FREE.customers && (
                <span className="ml-2 text-orange-500 font-medium flex items-center">
                  (Limit reached - <Link href="/settings" className="underline hover:text-orange-600 transition-colors duration-200 ml-1">upgrade</Link> for unlimited)
                </span>
              )}
            </p>
          )}
        </div>
        <Button asChild className="shadow-sm hover:shadow-md transition-all duration-300 bg-primary hover:bg-primary/90">
          <Link href="/customers/new" className="group">
            <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            New Customer
          </Link>
        </Button>
      </div>
      
      <Card className="hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
        <CardHeader className="border-b">
          <CardTitle>Manage Customers</CardTitle>
          <CardDescription>
            View and manage all your customer details in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2 animate-in fade-in duration-500">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="hover:bg-muted/80 transition-colors duration-200">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="rounded-md border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers?.map((customer) => (
                    <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors duration-200 group" onClick={() => handleCustomerSelect(customer.id)}>
                      <TableCell className="font-medium group-hover:text-primary transition-colors duration-200">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell>{formatRelativeDate(customer.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="hover:bg-muted/80 transition-colors duration-200">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="animate-in fade-in-50 zoom-in-95 duration-100">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/invoices/new?customerId=${customer.id}`);
                              }}
                              className="hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors duration-200 cursor-pointer group"
                            >
                              <FileText className="mr-2 h-4 w-4 group-hover:text-primary transition-transform duration-200 group-hover:scale-110" />
                              Create Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `mailto:${customer.email}`;
                              }}
                              className="hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors duration-200 cursor-pointer group"
                            >
                              <Mail className="mr-2 h-4 w-4 group-hover:text-primary transition-transform duration-200 group-hover:scale-110" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `tel:${customer.phoneNumber}`;
                              }}
                              className="hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors duration-200 cursor-pointer group"
                            >
                              <Phone className="mr-2 h-4 w-4 group-hover:text-primary transition-transform duration-200 group-hover:scale-110" />
                              Call
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/customers/${customer.id}/edit`);
                              }}
                              className="hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors duration-200 cursor-pointer group"
                            >
                              <Edit className="mr-2 h-4 w-4 group-hover:text-primary transition-transform duration-200 group-hover:scale-110" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200 cursor-pointer group" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomer(customer.id);
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4 group-hover:text-red-600 transition-transform duration-200 group-hover:scale-110" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        </CardFooter>
      </Card>
      
      {/* Customer Detail Dialog */}
      {selectedCustomerId && (
        <CustomerDetailDialog
          customerId={selectedCustomerId}
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
        />
      )}
    </div>
  );
}
