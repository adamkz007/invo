'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// A simplified placeholder ReceiptForm
const ReceiptForm = () => {
  const router = useRouter();

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">Simple Receipt Form</h2>
      <p className="mb-4">
        This is a placeholder receipt form to debug import issues.
      </p>
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={() => router.push('/receipts')}
        >
          Cancel
        </Button>
        <Button>Create Receipt</Button>
      </div>
    </div>
  );
};

// Export the component using the more reliable named export approach
export { ReceiptForm };

// Also provide a default export
export default ReceiptForm; 