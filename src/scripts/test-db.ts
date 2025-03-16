import { prisma, testConnection } from '../lib/prisma';

async function main() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const connected = await testConnection();
  
  if (connected) {
    try {
      // Test specific tables
      console.log('Testing User table...');
      const userCount = await prisma.user.count();
      console.log(`User table accessible, count: ${userCount}`);
      
      console.log('Testing Company table...');
      const companyCount = await prisma.company.count();
      console.log(`Company table accessible, count: ${companyCount}`);
      
      console.log('Testing Invoice table...');
      const invoiceCount = await prisma.invoice.count();
      console.log(`Invoice table accessible, count: ${invoiceCount}`);
      
      console.log('Testing Product table...');
      const productCount = await prisma.product.count();
      console.log(`Product table accessible, count: ${productCount}`);
      
      console.log('All database tables are accessible!');
    } catch (error) {
      console.error('Error accessing specific tables:', error);
    }
  }
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 