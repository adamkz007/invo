'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
// Separator component replaced with div
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
}

interface Table {
  id: string;
  name: string;
  label: string;
  isActive: boolean;
}

interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

interface PosSettings {
  taxRate: number;
  serviceChargeRate: number;
}

type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export default function NewOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [settings, setSettings] = useState<PosSettings>({ taxRate: 0, serviceChargeRate: 0 });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, tablesRes, settingsRes] = await Promise.all([
        fetch('/api/product'),
        fetch('/api/pos/tables'),
        fetch('/api/pos/settings')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }

      if (tablesRes.ok) {
        const tablesData = await tablesRes.json();
        setTables(tablesData.tables || []);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings || { taxRate: 0, serviceChargeRate: 0 });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error(`Cannot add more ${product.name}. Stock limit reached.`);
        return;
      }
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      if (product.stock <= 0) {
        toast.error(`${product.name} is out of stock`);
        return;
      }
      const newItem: OrderItem = {
        productId: product.id,
        product,
        quantity: 1,
        price: product.price,
        total: product.price
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      toast.error(`Cannot exceed stock limit of ${product.stock}`);
      return;
    }

    setOrderItems(orderItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ));
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const serviceCharge = subtotal * (settings.serviceChargeRate / 100);
  const taxAmount = (subtotal + serviceCharge) * (settings.taxRate / 100);
  const total = subtotal + serviceCharge + taxAmount;

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      toast.error('Please add items to the order');
      return;
    }

    if (orderType === 'DINE_IN' && !selectedTable) {
      toast.error('Please select a table for dine-in orders');
      return;
    }

    setSubmitting(true);
    try {
      // Find the selected table object to get the table name/number if it's a dine-in order
      let tableNumber = 'N/A';
      let tableId = null;
      
      if (orderType === 'DINE_IN') {
        const selectedTableObj = tables.find(table => table.id === selectedTable);
        if (!selectedTableObj) {
          toast.error('Selected table not found');
          setSubmitting(false);
          return;
        }
        tableNumber = selectedTableObj.name;
        tableId = selectedTable;
      }

      const response = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          tableNumber,
          items: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price, // Use item.price as unitPrice to match API expectations
            notes: '' // Add empty notes field
          })),
          notes,
          subtotal,
          serviceCharge,
          taxAmount,
          total,
          orderType
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Order created successfully!');
        router.push(`/pos`);
      } else {
        const errorData = await response.text();
        let errorMessage = 'Failed to create order';
        try {
          const error = JSON.parse(errorData);
          console.error('Order creation error:', error);
          errorMessage = error.error || errorMessage;
        } catch (e) {
          console.error('Error parsing response:', errorData);
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Order</h1>
          <p className="text-muted-foreground">
            Create a new POS order
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Select products to add to the order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search Products</Label>
                <Input
                  id="search"
                  placeholder="Search by product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => addToOrder(product)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{product.name}</h4>
                        {product.stock <= 5 && (
                          <Badge variant="destructive" className="text-xs">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock} | RM {product.price.toFixed(2)}
                      </p>
                    </div>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No products found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orderType">Order Type</Label>
                <Select value={orderType} onValueChange={(value: OrderType) => setOrderType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DINE_IN">Dine In</SelectItem>
                    <SelectItem value="TAKEAWAY">Takeaway</SelectItem>
                    <SelectItem value="DELIVERY">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType === 'DINE_IN' && (
                <div>
                  <Label htmlFor="table">Table</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.filter(table => table.isActive).map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="border-t" />

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-medium">Items ({orderItems.length})</h4>
                {orderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items added
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.productId} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            RM {item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromOrder(item.productId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>RM {subtotal.toFixed(2)}</span>
                </div>
                {settings.serviceChargeRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Service Charge ({settings.serviceChargeRate}%):</span>
                    <span>RM {serviceCharge.toFixed(2)}</span>
                  </div>
                )}
                {settings.taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax ({settings.taxRate}%):</span>
                    <span>RM {taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>RM {total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={submitting || orderItems.length === 0 || (orderType === 'DINE_IN' && !selectedTable)}
              >
                {submitting ? 'Creating Order...' : 'Create Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}