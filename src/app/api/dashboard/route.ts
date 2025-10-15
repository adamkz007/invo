import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDashboardOverview } from '@/lib/data/dashboard';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getDashboardOverview(user.id);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, max-age=0, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Failed to compute dashboard overview', error);
    return NextResponse.json({ error: 'Failed to compute dashboard overview' }, { status: 500 });
  }
}
