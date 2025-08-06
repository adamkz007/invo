'use client';

import { Card, CardContent, CardHeader, CardTitle, TooltipCardTitle } from '@/components/ui/card';
import ProductForm from '@/components/inventory/product-form';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link 
          href="/inventory" 
          className="mr-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <Package className="h-4 w-4" />
          <span>Inventory</span>
        </Link>
        <h1 className="text-3xl font-bold">Create New Product</h1>
      </div>
      
      <Card>
        <CardHeader>
          <TooltipCardTitle tooltip="Add a new product or service to your inventory">
            Product Details
          </TooltipCardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
