import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/utils';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const passwordHash = await hashPassword('password123');
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      passwordHash,
    },
  });
  
  console.log(`Created user: ${user.name} (${user.id})`);
  
  // Create test customers
  const customers = [
    {
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phoneNumber: '123-456-7890',
      address: '123 Main St, New York, NY',
      notes: 'Large enterprise customer',
      userId: user.id,
    },
    {
      name: 'Globex Industries',
      email: 'info@globex.com',
      phoneNumber: '234-567-8901',
      address: '456 Oak Ave, San Francisco, CA',
      notes: 'Prefers communication via email',
      userId: user.id,
    },
    {
      name: 'Wayne Enterprises',
      email: 'business@wayne.com',
      phoneNumber: '345-678-9012',
      address: '789 Gotham Rd, Gotham City',
      notes: 'Payment terms: Net 15',
      userId: user.id,
    },
  ];
  
  // Clear existing customers for this user
  await prisma.customer.deleteMany({
    where: { userId: user.id }
  });
  
  // Create new customers
  for (const customer of customers) {
    await prisma.customer.create({
      data: customer,
    });
  }
  
  console.log(`Created ${customers.length} customers`);
  
  // Create test products
  const products = [
    {
      name: 'Web Development',
      description: 'Custom website development',
      price: 2500,
      quantity: 999,
      sku: 'WEB-001',
      userId: user.id,
    },
    {
      name: 'Mobile App Development',
      description: 'Native mobile application',
      price: 5000,
      quantity: 999,
      sku: 'APP-001',
      userId: user.id,
    },
    {
      name: 'SEO Consulting',
      description: 'Search engine optimization services',
      price: 1000,
      quantity: 999,
      sku: 'SEO-001',
      userId: user.id,
    },
    {
      name: 'UI/UX Design',
      description: 'User interface and experience design',
      price: 1500,
      quantity: 999,
      sku: 'UX-001',
      userId: user.id,
    },
  ];
  
  // Clear existing products for this user
  await prisma.product.deleteMany({
    where: { userId: user.id }
  });
  
  // Create new products
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }
  
  console.log(`Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 