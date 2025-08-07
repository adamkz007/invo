// Script to check if product with ID 'cmdxaes250001nwf2h4x9p9k7' exists in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProduct() {
  try {
    // Check if product with ID 'cmdxaes250001nwf2h4x9p9k7' exists
    const productId = 'cmdxaes250001nwf2h4x9p9k7';
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    console.log(`Product with ID ${productId}:`, product);
    
    // If product doesn't exist, let's check all products
    if (!product) {
      const allProducts = await prisma.product.findMany();
      console.log('All products in database:', allProducts);
    }
  } catch (error) {
    console.error('Error checking product:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct();