import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { posModuleMiddleware } from '../middleware';

// GET /api/pos/tables - Get all tables for the user
export async function GET(request: NextRequest) {
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

    const tables = await prisma.posTable.findMany({
      where: {
        userId: user.id,
      },
      include: {
        orders: {
          where: {
            status: {
              in: ['KITCHEN', 'TO_PAY'],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Add active order count and status to each table
    const tablesWithStatus = tables.map(table => ({
      ...table,
      hasActiveOrder: table.orders.length > 0,
      activeOrder: table.orders[0] || null,
    }));

    return NextResponse.json({ tables: tablesWithStatus });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

// POST /api/pos/tables - Create a new table
export async function POST(request: NextRequest) {
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
    const { name, label, capacity = 4, positionX = 0, positionY = 0 } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Table name is required' },
        { status: 400 }
      );
    }

    // Check if table name already exists for this user
    const existingTable = await prisma.posTable.findFirst({
      where: {
        userId: user.id,
        name,
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { error: 'Table name already exists' },
        { status: 400 }
      );
    }

    const table = await prisma.posTable.create({
      data: {
        name,
        label: label || name,
        capacity: Math.max(1, capacity),
        positionX,
        positionY,
        userId: user.id,
      },
    });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}