import { prisma } from '@/lib/prisma';

export async function getUserSubscriptionStatus(userId: string): Promise<string> {
  const record = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
    },
  });

  return record?.subscriptionStatus ?? 'FREE';
}
