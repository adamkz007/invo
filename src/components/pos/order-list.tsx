'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, DollarSign, Eye, Edit, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  status: 'KITCHEN' | 'TO_PAY' | 'COMPLETED' | 'CANCELLED';
  total: number;
  createdAt: string;
  notes?: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
}

interface OrderListProps {
  orders: Order[];
  onOrderUpdate: () => void;
  compact?: boolean;
}

const statusConfig = {
  KITCHEN: { label: 'In Kitchen', color: 'bg-orange-500', icon: Clock },
  TO_PAY: { label: 'Ready to Pay', color: 'bg-blue-500', icon: DollarSign },
  COMPLETED: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

export function OrderList({ orders, onOrderUpdate, compact = false }: OrderListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editNotes, setEditNotes] = useState('');

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/pos/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        onOrderUpdate();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const updateOrder = async () => {
    if (!editingOrder) return;

    setUpdating(editingOrder.id);
    try {
      const response = await fetch(`/api/pos/orders/${editingOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: editStatus,
          notes: editNotes 
        }),
      });

      if (response.ok) {
        toast.success('Order updated successfully');
        setEditingOrder(null);
        onOrderUpdate();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setUpdating(null);
    }
  };

  const printKitchenChit = async (orderId: string) => {
    try {
      const response = await fetch('/api/pos/print/chit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        toast.success('Kitchen chit sent to printer');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to print kitchen chit');
      }
    } catch (error) {
      console.error('Error printing kitchen chit:', error);
      toast.error('Failed to print kitchen chit');
    }
  };

  const openEditDialog = (order: Order) => {
    setEditingOrder(order);
    setEditStatus(order.status);
    setEditNotes(order.notes || '');
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = statusConfig[order.status];
        const StatusIcon = statusInfo.icon;
        
        return (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${statusInfo.color} text-white`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{order.orderNumber}</h3>
                      <Badge variant="outline">Table {order.tableNumber}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-semibold">RM {order.total.toFixed(2)}</p>
                    <Badge variant="secondary">{statusInfo.label}</Badge>
                  </div>
                  
                  {!compact && (
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                            <DialogDescription>
                              {selectedOrder?.orderNumber} - Table {selectedOrder?.tableNumber}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Items:</h4>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                      <span>{item.quantity}x {item.product.name}</span>
                                      <span>RM {(item.quantity * item.price).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {selectedOrder.notes && (
                                <div>
                                  <h4 className="font-medium mb-1">Notes:</h4>
                                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold">
                                <span>Total:</span>
                                <span>RM {selectedOrder.total.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditDialog(order)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Order</DialogTitle>
                            <DialogDescription>
                              Update order status and notes
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="KITCHEN">In Kitchen</SelectItem>
                                  <SelectItem value="TO_PAY">Ready to Pay</SelectItem>
                                  <SelectItem value="COMPLETED">Completed</SelectItem>
                                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea
                                id="notes"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Order notes..."
                                rows={3}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={updateOrder}
                              disabled={updating === editingOrder?.id}
                            >
                              {updating === editingOrder?.id ? 'Updating...' : 'Update Order'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {order.status === 'KITCHEN' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => printKitchenChit(order.id)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {!compact && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      {order.notes && ' • Has notes'}
                    </div>
                    
                    {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                      <div className="flex gap-2">
                        {order.status === 'KITCHEN' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'TO_PAY')}
                            disabled={updating === order.id}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'TO_PAY' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                            disabled={updating === order.id}
                          >
                            Complete Order
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                          disabled={updating === order.id}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}