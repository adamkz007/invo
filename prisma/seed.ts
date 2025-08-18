import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

// Define InvoiceStatus as a simple object
const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED'
} as const;

// Define hashPassword function directly
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const passwordHash = await hashPassword('password123');
  
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      phoneNumber: '123-456-7890',
      passwordHash,
    },
  });

  // Create some customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Acme Inc',
        email: 'contact@acme.com',
        phoneNumber: '123-456-7890',
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postcode: '12345',
        country: 'USA',
        notes: 'Important client',
        userId: user.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Globex Corp',
        email: 'info@globex.com',
        phoneNumber: '234-567-8901',
        street: '456 Oak Ave',
        city: 'Business City',
        state: 'NY',
        postcode: '67890',
        country: 'USA',
        notes: '',
        userId: user.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Wayne Enterprises',
        email: 'business@wayne.com',
        phoneNumber: '345-678-9012',
        street: '789 Gotham Rd',
        city: 'Gotham',
        state: 'NJ',
        postcode: '54321',
        country: 'USA',
        notes: '',
        userId: user.id,
      },
    }),
  ]);

  // Create some products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Web Development',
        description: 'Custom website development',
        price: 1200,
        quantity: 10,
        sku: 'WEB-001',
        disableStockManagement: false,
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mobile App Development',
        description: 'Custom mobile application',
        price: 2500,
        quantity: 5,
        sku: 'APP-001',
        disableStockManagement: false,
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'UI/UX Design',
        description: 'User interface and experience design',
        price: 800,
        quantity: 15,
        sku: 'DESIGN-001',
        disableStockManagement: false,
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'SEO Service',
        description: 'Search engine optimization',
        price: 500,
        quantity: 20,
        sku: 'SEO-001',
        disableStockManagement: false,
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Hosting (Monthly)',
        description: 'Web hosting service',
        price: 25,
        quantity: 100,
        sku: 'HOST-001',
        disableStockManagement: true,
        userId: user.id,
      },
    }),
  ]);

  // Create some invoices
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-0001-1234',
        issueDate: new Date('2023-01-15'),
        dueDate: new Date('2023-02-15'),
        status: InvoiceStatus.PAID,
        subtotal: 1200,
        taxRate: 10,
        taxAmount: 120,
        discountRate: 0,
        discountAmount: 0,
        total: 1320,
        paidAmount: 1320,
        notes: 'Thank you for your business!',
        customerId: customers[0].id,
        userId: user.id,
        items: {
          create: [
            {
              quantity: 1,
              unitPrice: 1200,
              amount: 1200,
              description: 'Website development for Acme Inc',
              productId: products[0].id,
            },
          ],
        },
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-0002-2345',
        issueDate: new Date('2023-02-01'),
        dueDate: new Date('2023-03-01'),
        status: InvoiceStatus.SENT,
        subtotal: 3300,
        taxRate: 10,
        taxAmount: 330,
        discountRate: 5,
        discountAmount: 165,
        total: 3465,
        notes: '',
        customerId: customers[1].id,
        userId: user.id,
        items: {
          create: [
            {
              quantity: 1,
              unitPrice: 2500,
              amount: 2500,
              description: 'Mobile app development for Globex Corp',
              productId: products[1].id,
            },
            {
              quantity: 1,
              unitPrice: 800,
              amount: 800,
              description: 'UI/UX Design for mobile app',
              productId: products[2].id,
            },
          ],
        },
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-0003-3456',
        issueDate: new Date('2023-03-10'),
        dueDate: new Date('2023-04-10'),
        status: InvoiceStatus.PARTIAL,
        subtotal: 1300,
        taxRate: 10,
        taxAmount: 130,
        discountRate: 0,
        discountAmount: 0,
        total: 1430,
        paidAmount: 700,
        notes: 'Partial payment received',
        customerId: customers[2].id,
        userId: user.id,
        items: {
          create: [
            {
              quantity: 1,
              unitPrice: 800,
              amount: 800,
              description: 'UI/UX Design for Wayne Enterprises',
              productId: products[2].id,
            },
            {
              quantity: 1,
              unitPrice: 500,
              amount: 500,
              description: 'SEO Service for Wayne Enterprises',
              productId: products[3].id,
            },
          ],
        },
      },
    }),
  ]);

  // Create company profile
  const company = await prisma.company.create({
    data: {
      legalName: 'Demo Company LLC',
      ownerName: 'Demo User',
      registrationNumber: 'REG123456',
      taxIdentificationNumber: 'TAX123456',
      email: 'contact@democompany.com',
      phoneNumber: '123-456-7890',
      address: '123 Business Ave, Commerce City, USA',
      userId: user.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });