import fetch from 'node-fetch';

async function testApiRoute(route: string) {
  try {
    console.log(`Testing API route: ${route}`);
    const response = await fetch(`http://localhost:3000/api/${route}`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
    return response.status === 200;
  } catch (error) {
    console.error(`Error testing ${route}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting API tests...');
  
  // Wait for the server to start
  console.log('Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test all API routes
  const routes = ['dashboard', 'company', 'invoice', 'product', 'customer'];
  
  let allPassed = true;
  
  for (const route of routes) {
    const passed = await testApiRoute(route);
    if (!passed) {
      allPassed = false;
      console.error(`❌ Route /api/${route} failed`);
    } else {
      console.log(`✅ Route /api/${route} passed`);
    }
  }
  
  if (allPassed) {
    console.log('🎉 All API routes are working!');
  } else {
    console.error('❌ Some API routes failed');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 