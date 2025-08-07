// Import the receipts array from the API route
const { receipts } = require('./src/app/api/receipts/route');

console.log('Receipts in memory:', receipts.length);
console.log(JSON.stringify(receipts, null, 2));