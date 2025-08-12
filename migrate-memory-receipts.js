// Script to migrate receipts to the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to get receipts from database or other source
async function getReceiptsToMigrate() {
  // TODO: Replace with your actual source of receipts
  // This is a placeholder - implement your own logic to get receipts that need migration
  console.log('Getting receipts to migrate from source...');
  return [];
}

// Function to get a valid user ID from the database
async function getValidUserId() {
  const users = await prisma.user.findMany({ take: 1 });
  if (users.length === 0) {
    throw new Error('No users found in the database');
  }
  return users[0].id;
}

// Function to check if product exists
async function checkProductExists(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  return !!product;
}

// Function to migrate a single receipt to the database
async function migrateReceipt(receipt) {
  try {
    // Check if receipt already exists in database
    const existingReceipt = await prisma.receipt.findUnique({
      where: { id: receipt.id },
    });

    if (existingReceipt) {
      console.log(`Receipt ${receipt.receiptNumber} already exists in database, skipping...`);
      return null;
    }
    
    // Get a valid user ID
    const validUserId = await getValidUserId();
    console.log(`Using valid user ID: ${validUserId} instead of ${receipt.userId}`);
    
    // Create the receipt in the database
    const createdReceipt = await prisma.receipt.create({
      data: {
        id: receipt.id, // Preserve the original ID
        receiptNumber: receipt.receiptNumber,
        customerName: receipt.customerName,
        customerPhone: receipt.customerPhone,
        receiptDate: new Date(receipt.receiptDate),
        paymentMethod: receipt.paymentMethod,
        notes: receipt.notes || '',
        total: receipt.total,
        createdAt: new Date(receipt.createdAt),
        updatedAt: new Date(), // Current time for updatedAt
        userId: validUserId, // Use a valid user ID
      },
    });

    // Create receipt items
    if (receipt.items && receipt.items.length > 0) {
      for (const item of receipt.items) {
        // Check if product exists
        const productExists = await checkProductExists(item.productId);
        if (!productExists) {
          console.log(`Product with ID ${item.productId} does not exist, skipping item`);
          continue;
        }
        
        await prisma.receiptItem.create({
          data: {
            id: item.id, // Preserve the original ID
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            description: item.description || '',
            receiptId: createdReceipt.id,
            productId: item.productId,
            createdAt: new Date(receipt.createdAt),
            updatedAt: new Date(), // Current time for updatedAt
          },
        });
      }
    }

    console.log(`Migrated receipt ${receipt.receiptNumber} to database`);
    return createdReceipt;
  } catch (error) {
    console.error(`Error migrating receipt ${receipt.receiptNumber}:`, error);
    return null;
  }
}

// Main migration function
async function migrateReceipts() {
  try {
    console.log('Starting migration of receipts to database...');
    
    // Get receipts to migrate
    const receiptsToMigrate = await getReceiptsToMigrate();
    console.log(`Found ${receiptsToMigrate.length} receipts to migrate`);
    
    if (receiptsToMigrate.length === 0) {
      console.log('No receipts to migrate');
      return;
    }
    
    // Migrate each receipt
    let successCount = 0;
    let failCount = 0;
    
    for (const receipt of receiptsToMigrate) {
      const result = await migrateReceipt(receipt);
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    console.log('Migration complete!');
    console.log(`Successfully migrated: ${successCount} receipts`);
    console.log(`Failed to migrate: ${failCount} receipts`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateReceipts();