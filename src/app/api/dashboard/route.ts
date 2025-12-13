import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDashboardOverview } from '@/lib/data/dashboard';

export async function GET(req: NextRequest) {
  const start = performance.now();
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getDashboardOverview(user.id);
    const duration = Number((performance.now() - start).toFixed(1));
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, max-age=0, s-maxage=300',
        'Server-Timing': `total;dur=${duration}`,
      },
    });
  } catch (error) {
    console.error('Failed to compute dashboard overview', error);
    const duration = Number((performance.now() - start).toFixed(1));
    return NextResponse.json(
      { error: 'Failed to compute dashboard overview' },
      { status: 500, headers: { 'Server-Timing': `total;dur=${duration}` } },
    );
  }
}
