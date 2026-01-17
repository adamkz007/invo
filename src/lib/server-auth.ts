import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) {
    return null;
  }

  try {
    return await verifyToken(token);
  } catch (error) {
    console.error('Failed to verify auth token', error);
    return null;
  }
}
