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
import { Plus, MoreHorizontal, Search, Filter, Edit, Trash, Package, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { ProductWithRelations } from '@/types';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';
import { QuickEditDialog } from '@/components/inventory/quick-edit-dialog';
import { Badge } from '@/components/ui/badge';

// Remove mock data and use API

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const router = useRouter();
  const { showToast } = useToast();
  const { settings } = useSettings();
  
  // Fetch products from API
  const fetchProducts = async () => {
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
  };
  
  useEffect(() => {
    fetchProducts();
  }, [showToast]);

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
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
      
      // Remove the deleted product from the state
      setProducts(products.filter(product => product.id !== productId));
      
      showToast({
        message: 'Product deleted successfully',
        variant: 'success',
      });
      
      // Recalculate inventory value
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast({
        message: 'Failed to delete product. Please try again.',
        variant: 'error',
      });
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your products and inventory
          </p>
        </div>
        <Link href="/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Inventory Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="font-medium">Total Inventory Value:</span>
            </div>
            <span className="font-bold">{formatCurrency(totalInventoryValue, settings)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading inventory...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => router.refresh()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No products match your search' : 'No products found'}
              </p>
              <Link href="/inventory/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) :
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku || 'N/A'}</TableCell>
                    <TableCell>{formatCurrency(product.price, settings)}</TableCell>
                    <TableCell>
                      {product.disableStockManagement ? (
                        <Badge variant="outline">Unlimited</Badge>
                      ) : (
                        product.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      {product.disableStockManagement ? (
                        <Badge variant="secondary">Service</Badge>
                      ) : (
                        <Badge variant="outline">Product</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <QuickEditDialog 
                          product={product} 
                          onProductUpdated={fetchProducts} 
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/inventory/${product.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <div className="text-xs text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </CardFooter>
        </Card>
      }
    </div>
  );
}
