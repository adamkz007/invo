'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, DollarSign, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { OrderList } from '@/components/pos/order-list';
import { OrderStats } from '@/components/pos/order-stats';

interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: string | null;
  customerName?: string | null;
  status: 'KITCHEN' | 'TO_PAY' | 'COMPLETED' | 'CANCELLED';
  total: number;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
}

interface OrderStats {
  totalOrders: number;
  activeOrders: number;
  completedToday: number;
  totalSales: number;
}

export default function POSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    activeOrders: 0,
    completedToday: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | Order['status']>('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/pos/orders?limit=20');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        
        // Calculate stats
        const activeOrders = data.orders?.filter((order: Order) => 
          ['KITCHEN', 'TO_PAY'].includes(order.status)
        ).length || 0;
        
        const today = new Date().toDateString();
        const completedToday = data.orders?.filter((order: Order) => 
          order.status === 'COMPLETED' && 
          new Date(order.createdAt).toDateString() === today
        ).length || 0;
        
        const totalSales = data.orders?.filter((order: Order) => 
          order.status === 'COMPLETED' && 
          new Date(order.createdAt).toDateString() === today
        ).reduce((sum: number, order: Order) => sum + order.total, 0) || 0;
        
        setStats({
          totalOrders: data.orders?.length || 0,
          activeOrders,
          completedToday,
          totalSales,
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = () => {
    fetchOrders();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (order.tableNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'ALL' ? true : order.status === filter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground">
            Fast ordering, customer tagging, and receipts on any device
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href="/pos/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <OrderStats stats={stats} />

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Orders</CardTitle>
          <CardDescription>Search by order, table tag, or customer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'KITCHEN', 'TO_PAY', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={filter === status ? 'default' : 'outline'}
                  onClick={() => setFilter(status)}
                >
                  {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          <OrderList orders={filteredOrders} onOrderUpdate={handleOrderUpdate} />
        </CardContent>
      </Card>
    </div>
  );
}