'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Users, Clock, Edit, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Table {
  id: string;
  name: string;
  label: string;
  capacity: number;
  positionX?: number;
  positionY?: number;
  isActive: boolean;
  hasActiveOrder: boolean;
  activeOrder: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
  } | null;
}

interface TableGridProps {
  compact?: boolean;
}

export function TableGrid({ compact = false }: TableGridProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    capacity: 4,
    positionX: 0,
    positionY: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/pos/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables || []);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      capacity: 4,
      positionX: 0,
      positionY: 0,
      isActive: true,
    });
  };

  const openEditDialog = (table: Table) => {
    setEditing(table);
    setFormData({
      name: table.name,
      label: table.label,
      capacity: table.capacity,
      positionX: table.positionX || 0,
      positionY: table.positionY || 0,
      isActive: table.isActive,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.label.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const url = editing ? `/api/pos/tables/${editing.id}` : '/api/pos/tables';
      const method = editing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editing ? 'Table updated successfully' : 'Table created successfully');
        setEditing(null);
        resetForm();
        fetchTables();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${editing ? 'update' : 'create'} table`);
      }
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error(`Failed to ${editing ? 'update' : 'create'} table`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tableId: string) => {
    setDeleting(tableId);
    try {
      const response = await fetch(`/api/pos/tables/${tableId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Table deactivated successfully');
        fetchTables();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to deactivate table');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Failed to deactivate table');
    } finally {
      setDeleting(null);
    }
  };

  const getTableStatus = (table: Table) => {
    if (!table.isActive) return { status: 'inactive', color: 'bg-gray-500' };
    if (!table.hasActiveOrder) return { status: 'available', color: 'bg-green-500' };
    return { status: 'occupied', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Tables</h3>
            <p className="text-sm text-muted-foreground">
              Manage your restaurant tables
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Table' : 'Add New Table'}</DialogTitle>
                <DialogDescription>
                  {editing ? 'Update table information' : 'Create a new table for your restaurant'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Table Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., table-1"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="label">Display Label *</Label>
                    <Input
                      id="label"
                      placeholder="e.g., Table 1"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Select 
                      value={formData.capacity.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, capacity: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'person' : 'people'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="positionX">Position X</Label>
                    <Input
                      id="positionX"
                      type="number"
                      placeholder="X coordinate"
                      value={formData.positionX}
                      onChange={(e) => setFormData({ ...formData, positionX: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="positionY">Position Y</Label>
                    <Input
                      id="positionY"
                      type="number"
                      placeholder="Y coordinate"
                      value={formData.positionY}
                      onChange={(e) => setFormData({ ...formData, positionY: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleSubmit}
                  disabled={creating}
                >
                  {creating ? 'Saving...' : editing ? 'Update Table' : 'Create Table'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {tables.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No tables configured</p>
          {!compact && (
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Table</DialogTitle>
                  <DialogDescription>
                    Create a new table for your restaurant
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Table Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., table-1"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="label">Display Label *</Label>
                      <Input
                        id="label"
                        placeholder="e.g., Table 1"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Select 
                        value={formData.capacity.toString()} 
                        onValueChange={(value) => setFormData({ ...formData, capacity: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'person' : 'people'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="positionX">Position X</Label>
                      <Input
                        id="positionX"
                        type="number"
                        placeholder="X coordinate"
                        value={formData.positionX}
                        onChange={(e) => setFormData({ ...formData, positionX: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="positionY">Position Y</Label>
                      <Input
                        id="positionY"
                        type="number"
                        placeholder="Y coordinate"
                        value={formData.positionY}
                        onChange={(e) => setFormData({ ...formData, positionY: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleSubmit}
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create Table'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 ${compact ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {tables.map((table) => {
            const tableStatus = getTableStatus(table);
            return (
              <Card key={table.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{table.label}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${tableStatus.color}`} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{table.capacity} seats</span>
                    {(table.positionX !== undefined || table.positionY !== undefined) && (
                      <>
                        <MapPin className="h-4 w-4" />
                        <span>({table.positionX || 0}, {table.positionY || 0})</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={tableStatus.status === 'available' ? 'default' : 
                                tableStatus.status === 'occupied' ? 'destructive' : 'secondary'}
                      >
                        {tableStatus.status === 'available' ? 'Available' :
                         tableStatus.status === 'occupied' ? 'Occupied' : 'Inactive'}
                      </Badge>
                      {table.hasActiveOrder && (
                        <span className="text-sm text-muted-foreground">
                          1 active order
                        </span>
                      )}
                    </div>
                    
                    {table.hasActiveOrder && table.activeOrder && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {table.activeOrder.orderNumber}
                          </span>
                          <span>RM {table.activeOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    
                    {!compact && (
                      <div className="flex gap-1 mt-3">
                        {tableStatus.status === 'available' && (
                          <Link href={`/pos/new?table=${table.id}`} className="flex-1">
                            <Button size="sm" className="w-full">
                              New Order
                            </Button>
                          </Link>
                        )}
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openEditDialog(table)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Table</DialogTitle>
                              <DialogDescription>
                                Update table information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="name">Table Name *</Label>
                                  <Input
                                    id="name"
                                    placeholder="e.g., table-1"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="label">Display Label *</Label>
                                  <Input
                                    id="label"
                                    placeholder="e.g., Table 1"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="capacity">Capacity</Label>
                                  <Select 
                                    value={formData.capacity.toString()} 
                                    onValueChange={(value) => setFormData({ ...formData, capacity: parseInt(value) })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                                        <SelectItem key={num} value={num.toString()}>
                                          {num} {num === 1 ? 'person' : 'people'}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="positionX">Position X</Label>
                                  <Input
                                    id="positionX"
                                    type="number"
                                    placeholder="X coordinate"
                                    value={formData.positionX}
                                    onChange={(e) => setFormData({ ...formData, positionX: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="positionY">Position Y</Label>
                                  <Input
                                    id="positionY"
                                    type="number"
                                    placeholder="Y coordinate"
                                    value={formData.positionY}
                                    onChange={(e) => setFormData({ ...formData, positionY: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="isActive"
                                  checked={formData.isActive}
                                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive">Active</Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={handleSubmit}
                                disabled={creating}
                              >
                                {creating ? 'Updating...' : 'Update Table'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        {!table.hasActiveOrder && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(table.id)}
                            disabled={deleting === table.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TableGrid;