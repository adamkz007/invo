'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { Plus, MoreHorizontal, Search, FileText, Mail, Phone, Edit, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatRelativeDate } from '@/lib/utils';
import { CustomerWithRelations } from '@/types';
import { useToast } from '@/components/ui/toast';
import { CustomerDetailDialog } from '@/components/customers/customer-detail-dialog';
import { PLAN_LIMITS } from '@/lib/plan-limits';

interface CustomersPageData {
  data: CustomerWithRelations[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

interface CustomersClientProps {
  initialPage: CustomersPageData;
  initialSubscription: string;
}

export function CustomersClient({ initialPage, initialSubscription }: CustomersClientProps) {
  const [customers, setCustomers] = useState<CustomerWithRelations[]>(initialPage.data);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(initialPage.page);
  const [totalPages, setTotalPages] = useState(initialPage.totalPages);
  const [totalCount, setTotalCount] = useState(initialPage.totalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const userSubscription = initialSubscription;
  const skipInitialSearchFetch = useRef(true);

  useEffect(() => {
    setCustomers(initialPage.data);
    setPage(initialPage.page);
    setTotalPages(initialPage.totalPages);
    setTotalCount(initialPage.totalCount);
  }, [initialPage]);

  const fetchPage = useCallback(
    async (targetPage: number, search: string, signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: targetPage.toString(),
          search,
          limit: initialPage.pageSize.toString(),
        });
        const response = await fetch(`/api/customers?${params.toString()}`, {
          cache: 'no-store',
          signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }

        const data: CustomersPageData = await response.json();
        setCustomers(data.data);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.data?.length || 0);
        setPage(data.page);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Error fetching customers:', err);
        showToast({
          message: 'Failed to load customers. Please try again.',
          variant: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [initialPage.pageSize, showToast],
  );

  useEffect(() => {
    if (skipInitialSearchFetch.current && searchQuery === '') {
      skipInitialSearchFetch.current = false;
      return;
    }

    skipInitialSearchFetch.current = false;

    const controller = new AbortController();
    const handler = setTimeout(() => {
      fetchPage(1, searchQuery, controller.signal);
      setPage(1);
    }, 250);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [fetchPage, searchQuery]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      fetchPage(nextPage, searchQuery);
    },
    [fetchPage, searchQuery],
  );

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

      setCustomers((current) => current.filter((customer) => customer.id !== customerId));
      fetchPage(page, searchQuery);

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

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          {userSubscription === 'FREE' && (
            <p className="text-muted-foreground mt-1 flex items-center">
              <span className="inline-flex items-center">
                Used <span className="font-medium mx-1">{totalCount}</span> of{' '}
                <span className="font-medium mx-1">{PLAN_LIMITS.FREE.customers}</span> customers
              </span>
              {totalCount >= PLAN_LIMITS.FREE.customers && (
                <span className="ml-2 text-orange-500 font-medium flex items-center">
                  (Limit reached -{' '}
                  <Link href="/settings" className="underline hover:text-orange-600 transition-colors duration-200 ml-1">
                    upgrade
                  </Link>{' '}
                  for unlimited)
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

      <div className="space-y-4">
        <div className="mb-4 flex items-center gap-2 animate-in fade-in duration-500">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors duration-200 group"
                    onClick={() => handleCustomerSelect(customer.id)}
                  >
                    <TableCell className="font-medium group-hover:text-primary transition-colors duration-200">
                      {customer.name}
                    </TableCell>
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Showing {customers.length} of {totalCount} customers
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

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
