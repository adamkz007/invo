import { redirect } from 'next/navigation';
import { InventoryClient } from './inventory-client';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { getProductsForUser } from '@/lib/data/products';

export default async function InventoryPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const products = await getProductsForUser(user.id);

  return <InventoryClient initialPage={products} />;
}
