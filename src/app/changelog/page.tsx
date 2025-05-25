import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white/80 rounded-lg shadow-xl border border-primary/20 p-8 relative">
        <Link href="/" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-muted-foreground mb-8">See what's new and improved in Invo.</p>
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold mb-2">v1.1</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li><span className="font-medium">Receipts!</span> Instantly issue receipts for cash/in-store transactions</li>
              <li>Improved invoice PDF layout</li>
              <li>Improved adding customer & inventory when creating invoice</li>
              <li>Fixed backend calculations for business metrics</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">v1.0</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li><span className="font-medium">Complete invoicing functionality</span>: create, edit, and send invoice to customer</li>
              <li>View your key business metrics in dashboard</li>
              <li>Seamlessly connect to customers via WhatsApp & email (if provided)</li>
              <li>Manage inventory & services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 