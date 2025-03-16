'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Plus, MoreHorizontal, Search, Filter, Edit, Trash, Package, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { ProductWithRelations } from '@/types';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';
import { QuickEditDialog } from '@/components/inventory/quick-edit-dialog';
import { Badge } from '@/components/ui/badge';

// Constants for pagination
const ITEMS_PER_PAGE = 10;

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  
  const router = useRouter();
  const { showToast } = useToast();
  const { settings } = useSettings();
  
  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data);
      
      // Calculate total inventory value - only include physical products (not services)
      const inventoryValue = data.reduce((total: number, product: any) => {
        // Only include products where disableStockManagement is false (physical products)
        if (!product.disableStockManagement) {
          return total + (product.price * product.quantity);
        }
        return total;
      }, 0);
      
      setTotalInventoryValue(inventoryValue);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      showToast({
        message: 'Failed to load inventory. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
      
      // Refresh the product list
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast({
        message: 'Failed to delete product. Please try again.',
        variant: 'error',
      });
    }
  }, [fetchProducts, showToast]);
  
  // Handle quick edit
  const handleQuickEdit = useCallback((product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsQuickEditOpen(true);
  }, []);
  
  // Handle quick edit save
  const handleQuickEditSave = useCallback(async (updatedProduct: Partial<ProductWithRelations>) => {
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
      
      // Refresh the product list
      fetchProducts();
      setIsQuickEditOpen(false);
    } catch (err) {
      console.error('Error updating product:', err);
      showToast({
        message: 'Failed to update product. Please try again.',
        variant: 'error',
      });
    }
  }, [selectedProduct, fetchProducts, showToast]);
  
  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [products, searchQuery]);
  
  // Calculate pagination
  const totalPages = useMemo(() => Math.ceil(filteredProducts.length / ITEMS_PER_PAGE), [filteredProducts]);
  
  // Get current page items
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }
  
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
      
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your products and inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-3 py-1">
                Total Value: {formatCurrency(totalInventoryValue, settings)}
              </Badge>
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
                              <DropdownMenuItem onClick={() => router.push(`/inventory/${product.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
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
        </CardContent>
      </Card>
      
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
