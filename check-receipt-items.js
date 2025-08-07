// Script to check receipt items in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReceiptItems() {
  try {
    // Get all receipt items with their associated receipts and products
    const receiptItems = await prisma.receiptItem.findMany({
      include: {
        receipt: true,
        product: true
      }
    });
    
    console.log('Receipt items in database:', receiptItems.length);
    console.log(JSON.stringify(receiptItems, null, 2));
    
    // Get all receipts with their items
    const receiptsWithItems = await prisma.receipt.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    console.log('\nReceipts with items:');
    console.log(JSON.stringify(receiptsWithItems, null, 2));
  } catch (error) {
    console.error('Error checking receipt items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReceiptItems();