import fetch from 'node-fetch';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

async function testUnauthenticatedRoute(
  route: string,
  expectedStatus: number,
  label: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/${route}`);
    const passed = response.status === expectedStatus;
    console.log(
      passed ? '✅' : '❌',
      `${label}: expected ${expectedStatus}, got ${response.status}`,
    );
    return passed;
  } catch (error) {
    console.error(`❌ ${label}:`, error);
    return false;
  }
}

async function testProtectedRoute(route: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/${route}`);
    const passed = response.status === 401;
    console.log(
      passed ? '✅' : '❌',
      `Protected route /api/${route}: expected 401, got ${response.status}`,
    );
    return passed;
  } catch (error) {
    console.error(`❌ Protected route /api/${route}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting API security tests...');
  console.log(`Base URL: ${BASE_URL}`);

  console.log('\nWaiting for server...');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  let allPassed = true;

  // Auth failure cases — IDOR / access control
  const securityTests = [
    { route: 'receipts/nonexistent-id', status: 401, label: 'Receipt IDOR (no auth)' },
    {
      route: 'uploads/product-image/products/fake-user-id/test.jpg',
      status: 401,
      label: 'Product image GET (no auth)',
    },
  ];

  console.log('\n--- Security access control tests ---');
  for (const test of securityTests) {
    const passed = await testUnauthenticatedRoute(test.route, test.status, test.label);
    if (!passed) allPassed = false;
  }

  // Protected routes should return 401 without auth
  const protectedRoutes = ['dashboard', 'company', 'customers', 'products', 'invoices'];
  console.log('\n--- Protected route tests ---');
  for (const route of protectedRoutes) {
    const passed = await testProtectedRoute(route);
    if (!passed) allPassed = false;
  }

  if (allPassed) {
    console.log('\n🎉 All API security tests passed!');
  } else {
    console.error('\n❌ Some API security tests failed');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error running tests:', error);
  process.exit(1);
});
