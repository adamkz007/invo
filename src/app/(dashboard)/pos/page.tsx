'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { OrderList } from '@/components/pos/order-list';
import { OrderStats } from '@/components/pos/order-stats';
import { TableGrid } from '@/components/pos/table-grid';

interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
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
  const [activeTab, setActiveTab] = useState('orders');

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground">
            Manage orders, tables, and kitchen operations
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pos/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders in kitchen or ready to pay
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Orders completed today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {stats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue from completed orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                Manage and track all POS orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderList orders={orders} onOrderUpdate={handleOrderUpdate} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Management</CardTitle>
              <CardDescription>
                Configure and monitor your restaurant tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableGrid />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}