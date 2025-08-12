import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { posModuleMiddleware } from '../../middleware';

// GET /api/pos/tables/[id] - Get a specific table
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if POS module is enabled
  const middlewareResponse = await posModuleMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const table = await prisma.posTable.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        orders: {
          where: {
            status: {
              in: ['KITCHEN', 'TO_PAY'],
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table' },
      { status: 500 }
    );
  }
}

// PUT /api/pos/tables/[id] - Update a table
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if POS module is enabled
  const middlewareResponse = await posModuleMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, label, capacity, positionX, positionY, isActive } = body;

    // Check if table exists and belongs to user
    const existingTable = await prisma.posTable.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTable) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Check if new name conflicts with existing tables (if name is being changed)
    if (name && name !== existingTable.name) {
      const nameConflict = await prisma.posTable.findFirst({
        where: {
          userId: user.id,
          name,
          id: {
            not: params.id,
          },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Table name already exists' },
          { status: 400 }
        );
      }
    }

    const updatedTable = await prisma.posTable.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(label !== undefined && { label: label || name || existingTable.name }),
        ...(capacity !== undefined && { capacity: Math.max(1, capacity) }),
        ...(positionX !== undefined && { positionX }),
        ...(positionY !== undefined && { positionY }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ table: updatedTable });
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    );
  }
}

// DELETE /api/pos/tables/[id] - Delete a table
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if POS module is enabled
  const middlewareResponse = await posModuleMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if table exists and belongs to user
    const existingTable = await prisma.posTable.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTable) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Check if table has active orders
    const activeOrders = await prisma.posOrder.findFirst({
      where: {
        tableId: params.id,
        status: {
          in: ['KITCHEN', 'TO_PAY'],
        },
      },
    });

    if (activeOrders) {
      return NextResponse.json(
        { error: 'Cannot delete table with active orders' },
        { status: 400 }
      );
    }

    // Instead of deleting, set as inactive to preserve order history
    const deactivatedTable = await prisma.posTable.update({
      where: { id: params.id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      message: 'Table deactivated successfully',
      table: deactivatedTable 
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    );
  }
}