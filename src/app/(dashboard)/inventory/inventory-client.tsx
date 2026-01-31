'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  TooltipCardTitle,
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
import { Plus, MoreHorizontal, Search, Edit, Trash, Package, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { ProductSummary } from '@/types';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';
import { QuickEditDialog } from '@/components/inventory/quick-edit-dialog';
import { Badge } from '@/components/ui/badge';

interface InventoryPageData {
  data: ProductSummary[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

interface InventoryClientProps {
  initialPage: InventoryPageData;
}

export function InventoryClient({ initialPage }: InventoryClientProps) {
  const [products, setProducts] = useState<ProductSummary[]>(initialPage.data);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage.page);
  const [totalPages, setTotalPages] = useState(initialPage.totalPages);
  const [totalCount, setTotalCount] = useState(initialPage.totalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const { showToast } = useToast();
  const { settings } = useSettings();

  useEffect(() => {
    setProducts(initialPage.data);
    setCurrentPage(initialPage.page);
    setTotalPages(initialPage.totalPages);
    setTotalCount(initialPage.totalCount);
  }, [initialPage]);

  const fetchPage = useCallback(
    async (page: number, search?: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          search: search ?? '',
          limit: initialPage.pageSize.toString(),
        });
        const response = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data: InventoryPageData = await response.json();
        setProducts(
          data.data.map((product) => ({
            ...product,
          })),
        );
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (err) {
        console.error('Error fetching products:', err);
        showToast({
          message: 'Failed to load products. Please try again.',
          variant: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [initialPage.pageSize, showToast],
  );

  // Handle product deletion
  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      showToast({
        message: 'Product deleted successfully',
        variant: 'success',
      });
      
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      fetchPage(currentPage, searchQuery);
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast({
        message: 'Failed to delete product. Please try again.',
        variant: 'error',
      });
    }
  }, [currentPage, fetchPage, searchQuery, showToast]);
  
  // Handle quick edit
  const handleQuickEdit = useCallback((product: ProductSummary) => {
    setSelectedProduct(product);
    setIsQuickEditOpen(true);
  }, []);
  
  // Handle quick edit save
  const handleQuickEditSave = useCallback(async (updatedProduct: Partial<ProductSummary>) => {
    if (!selectedProduct) return;
    
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      showToast({
        message: 'Product updated successfully',
        variant: 'success',
      });

      setProducts((prev) =>
        prev.map((product) => {
          if (product.id !== selectedProduct.id) {
            return product;
          }

          return {
            ...product,
            price: updatedProduct.price ?? product.price,
            quantity: updatedProduct.quantity ?? product.quantity,
            disableStockManagement:
              updatedProduct.disableStockManagement ?? product.disableStockManagement,
            imageUrl: updatedProduct.imageUrl !== undefined ? updatedProduct.imageUrl : product.imageUrl,
          };
        }),
      );

      setSelectedProduct((prev) =>
        prev
          ? {
              ...prev,
              price: updatedProduct.price ?? prev.price,
              quantity: updatedProduct.quantity ?? prev.quantity,
              disableStockManagement:
                updatedProduct.disableStockManagement ?? prev.disableStockManagement,
              imageUrl: updatedProduct.imageUrl !== undefined ? updatedProduct.imageUrl : prev.imageUrl,
            }
          : prev,
      );
      setIsQuickEditOpen(false);
      fetchPage(currentPage, searchQuery);
    } catch (err) {
      console.error('Error updating product:', err);
      showToast({
        message: 'Failed to update product. Please try again.',
        variant: 'error',
      });
    }
  }, [fetchPage, currentPage, searchQuery, selectedProduct, showToast]);

  const totalInventoryValue = useMemo(
    () =>
      products.reduce((total, product) => {
        if (product.disableStockManagement) {
          return total;
        }
        return total + product.price * product.quantity;
      }, 0),
    [products],
  );

  const totalTrackedProducts = useMemo(
    () => products.filter((product) => !product.disableStockManagement).length,
    [products],
  );

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (product) => !product.disableStockManagement && product.quantity <= 5,
      ).length,
    [products],
  );
  
  // Filter products based on search query
  const currentProducts = products;

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchPage(page, searchQuery);
    },
    [fetchPage, searchQuery],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPage(1, searchQuery);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [fetchPage, searchQuery]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <Link href="/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {currentProducts.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
            <div className="text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No products found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {products.length === 0
                  ? "You haven&apos;t added any products yet."
                  : "No products match your search criteria."}
              </p>
              {products.length === 0 && (
                <Link href="/inventory/new">
                  <Button className="mt-4" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first product
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.imageUrl ? (
                          <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted/50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center rounded-md border bg-muted/30">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        {product.disableStockManagement ? (
                          <Badge variant="secondary">Service</Badge>
                        ) : (
                          <Badge variant="outline">Product</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price, settings)}</TableCell>
                      <TableCell>
                        {product.disableStockManagement ? (
                          <span className="text-muted-foreground">N/A</span>
                        ) : (
                          product.quantity
                        )}
                      </TableCell>
                      <TableCell>{product.sku || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleQuickEdit(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Quick Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Showing {currentProducts.length} of {totalCount} products
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
            
            {/* Inventory Summary Box */}
             <div className="mt-6 bg-muted/50 p-4 rounded-lg">
               <h3 className="text-lg font-medium mb-2">Inventory Summary</h3>
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <span>Total Inventory Value:</span>
                   <span className="font-bold">{formatCurrency(totalInventoryValue, settings)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Products:</span>
                  <span className="font-medium">{totalTrackedProducts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Low Stock Items:</span>
                  <span className="font-medium">{lowStockProducts}</span>
                </div>
              </div>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Quick Edit Dialog */}
      {selectedProduct && (
        <QuickEditDialog
          open={isQuickEditOpen}
          onOpenChange={setIsQuickEditOpen}
          product={selectedProduct}
          onSave={handleQuickEditSave}
        />
      )}
    </div>
  );
}
