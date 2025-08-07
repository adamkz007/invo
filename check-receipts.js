const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const receipts = await prisma.receipt.findMany();
    console.log('Receipts in database:', receipts.length);
    console.log(JSON.stringify(receipts, null, 2));
  } catch (error) {
    console.error('Error querying receipts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();