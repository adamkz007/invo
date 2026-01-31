import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/einvoice/config - Get e-invoice configuration
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await prisma.eInvoiceConfig.findUnique({
      where: { userId: user.id },
    });

    // Return null if no config exists (user hasn't set up e-invoice yet)
    if (!config) {
      return NextResponse.json(null);
    }

    // Don't expose the client secret hash
    const { myinvoisClientSecretHash, ...safeConfig } = config;
    return NextResponse.json({
      ...safeConfig,
      hasClientSecret: !!myinvoisClientSecretHash,
    });
  } catch (error) {
    console.error('Error fetching e-invoice config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch e-invoice configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/einvoice/config - Update e-invoice configuration
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields if enabling
    if (data.enabled) {
      if (!data.supplierTin) {
        return NextResponse.json(
          { error: 'Supplier TIN is required to enable e-Invoice' },
          { status: 400 }
        );
      }
    }

    // Check if config exists
    const existingConfig = await prisma.eInvoiceConfig.findUnique({
      where: { userId: user.id },
    });

    // Prepare update data - only include fields that are provided
    const updateData: any = {};

    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.environment !== undefined) updateData.environment = data.environment;
    if (data.myinvoisClientId !== undefined) updateData.myinvoisClientId = data.myinvoisClientId;
    if (data.supplierTin !== undefined) updateData.supplierTin = data.supplierTin;
    if (data.supplierBrn !== undefined) updateData.supplierBrn = data.supplierBrn;
    if (data.sstRegistrationNumber !== undefined) updateData.sstRegistrationNumber = data.sstRegistrationNumber;
    if (data.tourismTaxNumber !== undefined) updateData.tourismTaxNumber = data.tourismTaxNumber;
    if (data.defaultCurrencyCode !== undefined) updateData.defaultCurrencyCode = data.defaultCurrencyCode;
    if (data.autoSubmitOnSend !== undefined) updateData.autoSubmitOnSend = data.autoSubmitOnSend;
    if (data.peppolParticipantId !== undefined) updateData.peppolParticipantId = data.peppolParticipantId;
    if (data.peppolSchemeId !== undefined) updateData.peppolSchemeId = data.peppolSchemeId;

    // Handle client secret separately (hash it before storing)
    if (data.myinvoisClientSecret) {
      // In production, this should be encrypted with a proper encryption library
      // For now, we'll store a simple hash to indicate it's been set
      const crypto = require('crypto');
      updateData.myinvoisClientSecretHash = crypto
        .createHash('sha256')
        .update(data.myinvoisClientSecret)
        .digest('hex');
    }

    let config;

    if (existingConfig) {
      config = await prisma.eInvoiceConfig.update({
        where: { userId: user.id },
        data: updateData,
      });
    } else {
      config = await prisma.eInvoiceConfig.create({
        data: {
          userId: user.id,
          ...updateData,
        },
      });
    }

    // Don't expose the client secret hash
    const { myinvoisClientSecretHash, ...safeConfig } = config;
    return NextResponse.json({
      ...safeConfig,
      hasClientSecret: !!myinvoisClientSecretHash,
    });
  } catch (error) {
    console.error('Error updating e-invoice config:', error);
    return NextResponse.json(
      { error: 'Failed to update e-invoice configuration' },
      { status: 500 }
    );
  }
}
