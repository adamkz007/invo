import { prisma } from '@/lib/prisma';
import type { CustomerWithRelations } from '@/types';

type CustomerListOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function getCustomersForUser(
  userId: string,
  options: CustomerListOptions = {},
): Promise<{
  data: CustomerWithRelations[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}> {
  const page =
    options.page && Number.isFinite(options.page) && options.page > 0 ? Math.floor(options.page) : 1;
  const limit =
    options.limit && Number.isFinite(options.limit) && options.limit > 0
      ? Math.min(Math.floor(options.limit), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(options.search
      ? {
          OR: [
            { name: { contains: options.search, mode: 'insensitive' as const } },
            { email: { contains: options.search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: options.search } },
          ],
        }
      : {}),
  };

  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return {
    data: customers,
    totalCount,
    totalPages,
    page,
    pageSize: limit,
  };
}
