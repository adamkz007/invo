import { prisma } from '@/lib/prisma';
import {
  getSubscriptionUserSelect,
  isLifetimeUser,
  resolveEffectiveSubscriptionStatus,
} from '@/lib/subscription-status';

export async function getUserSubscriptionStatus(userId: string): Promise<string> {
  const record = await prisma.user.findUnique({
    where: { id: userId },
    select: getSubscriptionUserSelect(),
  });

  if (!record) {
    return 'FREE';
  }

  if (isLifetimeUser(record) && record.subscriptionStatus !== 'ACTIVE') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'ACTIVE',
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
      },
    });
  }

  return resolveEffectiveSubscriptionStatus(record);
}
