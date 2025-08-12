'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, DollarSign, TrendingUp, Users, ShoppingCart } from 'lucide-react';

interface OrderStatsProps {
  stats: {
    totalOrders: number;
    activeOrders: number;
    completedToday: number;
    totalSales: number;
    averageOrderValue?: number;
    busyTables?: number;
  };
}

export function OrderStats({ stats }: OrderStatsProps) {
  const statCards = [
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      description: 'Orders in kitchen or ready to pay',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      description: 'Orders completed today',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: "Today's Sales",
      value: `RM ${stats.totalSales.toFixed(2)}`,
      description: 'Revenue from completed orders',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      description: 'All orders in system',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  // Add optional stats if provided
  if (stats.averageOrderValue !== undefined) {
    statCards.push({
      title: 'Avg Order Value',
      value: `RM ${stats.averageOrderValue.toFixed(2)}`,
      description: 'Average order amount',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    });
  }

  if (stats.busyTables !== undefined) {
    statCards.push({
      title: 'Busy Tables',
      value: stats.busyTables,
      description: 'Tables with active orders',
      icon: Users,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}