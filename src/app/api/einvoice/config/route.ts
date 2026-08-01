import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { encryptSecret, isEncryptedSecret } from '@/lib/crypto';
import { safeErrorResponse } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await prisma.eInvoiceConfig.findUnique({
      where: { userId: user.id },
    });

    if (!config) {
      return NextResponse.json(null);
    }

    const { myinvoisClientSecretHash, ...safeConfig } = config;
    return NextResponse.json({
      ...safeConfig,
      hasClientSecret: Boolean(myinvoisClientSecretHash),
    });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to fetch e-invoice configuration');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (data.enabled && !data.supplierTin) {
      return NextResponse.json(
        { error: 'Supplier TIN is required to enable e-Invoice' },
        { status: 400 },
      );
    }

    const existingConfig = await prisma.eInvoiceConfig.findUnique({
      where: { userId: user.id },
    });

    const updateData: Record<string, unknown> = {};

    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.environment !== undefined) updateData.environment = data.environment;
    if (data.myinvoisClientId !== undefined) updateData.myinvoisClientId = data.myinvoisClientId;
    if (data.supplierTin !== undefined) updateData.supplierTin = data.supplierTin;
    if (data.supplierBrn !== undefined) updateData.supplierBrn = data.supplierBrn;
    if (data.sstRegistrationNumber !== undefined) {
      updateData.sstRegistrationNumber = data.sstRegistrationNumber;
    }
    if (data.tourismTaxNumber !== undefined) updateData.tourismTaxNumber = data.tourismTaxNumber;
    if (data.defaultCurrencyCode !== undefined) {
      updateData.defaultCurrencyCode = data.defaultCurrencyCode;
    }
    if (data.autoSubmitOnSend !== undefined) updateData.autoSubmitOnSend = data.autoSubmitOnSend;
    if (data.peppolParticipantId !== undefined) {
      updateData.peppolParticipantId = data.peppolParticipantId;
    }
    if (data.peppolSchemeId !== undefined) updateData.peppolSchemeId = data.peppolSchemeId;

    if (data.myinvoisClientSecret) {
      updateData.myinvoisClientSecretHash = encryptSecret(data.myinvoisClientSecret);
    } else if (
      existingConfig?.myinvoisClientSecretHash &&
      !isEncryptedSecret(existingConfig.myinvoisClientSecretHash) &&
      data.myinvoisClientSecret === undefined
    ) {
      // Legacy SHA-256 hash remains until user submits a new secret.
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

    const { myinvoisClientSecretHash, ...safeConfig } = config;
    return NextResponse.json({
      ...safeConfig,
      hasClientSecret: Boolean(myinvoisClientSecretHash),
    });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to update e-invoice configuration');
  }
}
