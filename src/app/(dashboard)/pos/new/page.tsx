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
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Tag, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string | null;
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

type OrderType = 'DINE_IN' | 'TAKEAWAY';

export default function NewOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<PosSettings>({ taxRate: 0, serviceChargeRate: 0 });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [tableTag, setTableTag] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeProduct = (product: Product) => ({
    ...product,
    price: Number(product.price) || 0,
  });

  const fetchData = async () => {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        fetch('/api/product'),
        fetch('/api/pos/settings')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts((productsData.products || []).map(normalizeProduct));
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

    const hasTagging = tableTag.trim() || customerName.trim();
    if (!hasTagging) {
      toast.error('Add a table tag or customer name for tracking');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: tableTag || customerName || 'N/A',
          items: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price, // Use item.price as unitPrice to match API expectations
            notes: '' // Add empty notes field
          })),
          notes: notes || `${customerName ? `Customer: ${customerName}. ` : ''}${customerPhone ? `Phone: ${customerPhone}` : ''}`.trim(),
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
              
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 max-h-[32rem] overflow-y-auto pr-1">
                {filteredProducts.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    className="flex flex-col rounded-lg border overflow-hidden text-left hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    onClick={() => addToOrder(product)}
                  >
                    {/* Product Image */}
                    {product.imageUrl ? (
                      <div className="w-full h-32 bg-muted/30 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 bg-muted/20 flex items-center justify-center">
                        <div className="text-4xl opacity-30">📦</div>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 p-3 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold leading-tight">{product.name}</h4>
                        <Badge variant="secondary" className="shrink-0">RM {product.price.toFixed(2)}</Badge>
                      </div>
                      <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                        <span>Stock: {product.stock}</span>
                        {product.stock <= 5 && (
                          <Badge variant="destructive" className="text-xs">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                      <div className="flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-primary mt-1">
                        <Plus className="h-4 w-4" />
                        Add
                      </div>
                    </div>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 col-span-full">
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tableTag" className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Table / Tag
                  </Label>
                  <Input
                    id="tableTag"
                    placeholder="e.g., T5, Bar, Counter"
                    value={tableTag}
                    onChange={(e) => setTableTag(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="customerName" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Customer
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Walk-in customer"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      placeholder="Optional"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

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
                disabled={submitting || orderItems.length === 0 || (!tableTag.trim() && !customerName.trim())}
              >
                {submitting ? 'Creating Order...' : 'Create Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile sticky summary */}
      {orderItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">RM {total.toFixed(2)}</p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || orderItems.length === 0 || (!tableTag.trim() && !customerName.trim())}
              className="min-w-[140px]"
            >
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}