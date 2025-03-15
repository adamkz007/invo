// Script to handle Prisma deployment in production
const { execSync } = require('child_process');

// Function to execute shell commands
function executeCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Main deployment function
async function deploy() {
  console.log('🚀 Starting database deployment...');
  
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  executeCommand('npx prisma generate');
  
  // Push schema changes to the database (safer than migrate in production)
  console.log('🔄 Pushing schema changes to database...');
  executeCommand('npx prisma db push --accept-data-loss');
  
  console.log('✅ Database deployment completed successfully!');
}

// Run the deployment
deploy().catch(err => {
  console.error('❌ Deployment failed:', err);
  process.exit(1);
}); 