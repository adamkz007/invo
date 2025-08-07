// Script to check if user with ID '1' exists in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    // Check if user with ID '1' exists
    const user = await prisma.user.findUnique({
      where: { id: '1' }
    });
    
    console.log('User with ID 1:', user);
    
    // If user doesn't exist, let's check all users
    if (!user) {
      const allUsers = await prisma.user.findMany();
      console.log('All users in database:', allUsers);
    }
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();