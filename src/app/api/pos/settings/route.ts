import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { posModuleMiddleware } from '../middleware';

// GET /api/pos/settings - Get POS settings for the user
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

    let settings = await prisma.posSettings.findUnique({
      where: {
        userId: user.id,
      },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.posSettings.create({
        data: {
          userId: user.id,
          autoPrintEnabled: false,
          tableLayoutType: 'LIST',
          taxRate: 0,
          serviceChargeRate: 0,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching POS settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/pos/settings - Update POS settings
export async function PUT(request: NextRequest) {
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
    const {
      autoPrintEnabled,
      defaultPrinterAddress,
      tableLayoutType,
      taxRate,
      serviceChargeRate,
    } = body;

    // Validate table layout type
    if (tableLayoutType && !['LIST', 'MAP'].includes(tableLayoutType)) {
      return NextResponse.json(
        { error: 'Invalid table layout type. Must be LIST or MAP' },
        { status: 400 }
      );
    }

    // Validate rates
    if (taxRate !== undefined && (taxRate < 0 || taxRate > 100)) {
      return NextResponse.json(
        { error: 'Tax rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (serviceChargeRate !== undefined && (serviceChargeRate < 0 || serviceChargeRate > 100)) {
      return NextResponse.json(
        { error: 'Service charge rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.posSettings.upsert({
      where: {
        userId: user.id,
      },
      update: {
        ...(autoPrintEnabled !== undefined && { autoPrintEnabled }),
        ...(defaultPrinterAddress !== undefined && { defaultPrinterAddress }),
        ...(tableLayoutType && { tableLayoutType }),
        ...(taxRate !== undefined && { taxRate }),
        ...(serviceChargeRate !== undefined && { serviceChargeRate }),
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        autoPrintEnabled: autoPrintEnabled ?? false,
        defaultPrinterAddress: defaultPrinterAddress || null,
        tableLayoutType: tableLayoutType || 'LIST',
        taxRate: taxRate ?? 0,
        serviceChargeRate: serviceChargeRate ?? 0,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating POS settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}