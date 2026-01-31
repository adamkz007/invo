import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/invoices/[id]/einvoice - Get e-invoice documents for an invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the invoice belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Get all e-invoice documents for this invoice
    const eInvoiceDocuments = await prisma.eInvoiceDocument.findMany({
      where: {
        invoiceId: id,
        userId: user.id,
      },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Only get last 10 events
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get the latest/active document
    const latestDocument = eInvoiceDocuments[0] || null;

    // Calculate e-invoice readiness (basic validation)
    const readiness = await calculateEInvoiceReadiness(invoice, user.id);

    return NextResponse.json({
      invoiceId: id,
      latestDocument,
      allDocuments: eInvoiceDocuments,
      readiness,
    });
  } catch (error) {
    console.error('Error fetching e-invoice state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch e-invoice state' },
      { status: 500 }
    );
  }
}

// Helper function to calculate e-invoice readiness
async function calculateEInvoiceReadiness(invoice: any, userId: string) {
  const errors: { field: string; message: string; category: string }[] = [];
  const warnings: { field: string; message: string; category: string }[] = [];

  // Check if e-invoice is configured
  const config = await prisma.eInvoiceConfig.findUnique({
    where: { userId },
  });

  if (!config || !config.enabled) {
    errors.push({
      field: 'config',
      message: 'E-Invoice is not enabled. Please configure e-Invoice settings first.',
      category: 'config',
    });
  } else {
    // Check supplier config
    if (!config.supplierTin) {
      errors.push({
        field: 'supplierTin',
        message: 'Supplier TIN is required',
        category: 'supplier',
      });
    }

    if (!config.myinvoisClientId) {
      errors.push({
        field: 'myinvoisClientId',
        message: 'MyInvois Client ID is required',
        category: 'config',
      });
    }

    if (!config.myinvoisClientSecretHash) {
      errors.push({
        field: 'myinvoisClientSecret',
        message: 'MyInvois Client Secret is required',
        category: 'config',
      });
    }
  }

  // Get company details
  const company = await prisma.company.findUnique({
    where: { userId },
  });

  if (!company) {
    errors.push({
      field: 'company',
      message: 'Company details are required',
      category: 'supplier',
    });
  } else {
    if (!company.legalName) {
      errors.push({
        field: 'legalName',
        message: 'Company legal name is required',
        category: 'supplier',
      });
    }
    if (!company.street && !company.address) {
      errors.push({
        field: 'address',
        message: 'Company address is required',
        category: 'supplier',
      });
    }
    if (!company.city) {
      errors.push({
        field: 'city',
        message: 'Company city is required',
        category: 'supplier',
      });
    }
    if (!company.postcode) {
      errors.push({
        field: 'postcode',
        message: 'Company postcode is required',
        category: 'supplier',
      });
    }
    if (!company.country) {
      warnings.push({
        field: 'country',
        message: 'Company country not set, defaulting to Malaysia',
        category: 'supplier',
      });
    }
    if (!company.phoneNumber) {
      warnings.push({
        field: 'phoneNumber',
        message: 'Company phone number is recommended',
        category: 'supplier',
      });
    }
  }

  // Get customer details
  const customer = await prisma.customer.findUnique({
    where: { id: invoice.customerId },
  });

  if (!customer) {
    errors.push({
      field: 'customer',
      message: 'Customer details are required',
      category: 'buyer',
    });
  } else {
    if (!customer.name) {
      errors.push({
        field: 'customerName',
        message: 'Customer name is required',
        category: 'buyer',
      });
    }
    // TIN is required for B2B, optional for B2C
    if (!customer.tin && !customer.taxIdentificationNumber) {
      warnings.push({
        field: 'customerTin',
        message: 'Customer TIN is recommended for B2B invoices',
        category: 'buyer',
      });
    }
  }

  // Get invoice items
  const items = await prisma.invoiceItem.findMany({
    where: { invoiceId: invoice.id },
    include: { product: true },
  });

  if (items.length === 0) {
    errors.push({
      field: 'items',
      message: 'Invoice must have at least one item',
      category: 'invoice',
    });
  }

  // Check each item
  items.forEach((item, index) => {
    if (!item.description && !item.product?.name) {
      errors.push({
        field: `items[${index}].description`,
        message: `Item ${index + 1} must have a description`,
        category: 'items',
      });
    }
  });

  const isReady = errors.length === 0;

  return {
    isReady,
    errors,
    warnings,
    summary: {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      byCategory: {
        config: errors.filter((e) => e.category === 'config').length,
        supplier: errors.filter((e) => e.category === 'supplier').length,
        buyer: errors.filter((e) => e.category === 'buyer').length,
        invoice: errors.filter((e) => e.category === 'invoice').length,
        items: errors.filter((e) => e.category === 'items').length,
      },
    },
  };
}
