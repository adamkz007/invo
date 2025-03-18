// This script is used to deploy the database schema to production
const { execSync } = require('child_process');

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production';

async function main() {
  try {
    // In production, we use db push to avoid migration history issues
    if (isProduction) {
      console.log('Running database push in production environment...');
      execSync('npx prisma db push', { stdio: 'inherit' });
    } else {
      // In development, we can use migrations
      console.log('Running database migrations in development environment...');
      execSync('npx prisma migrate dev', { stdio: 'inherit' });
    }
    
    console.log('Database deployment completed successfully');
  } catch (error) {
    console.error('Error deploying database:', error);
    process.exit(1);
  }
}

main(); 