import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getAccountBalances, getCashAccountIds } from '@/lib/accounting/balances';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;

  try {
    const cashAccountIds = await getCashAccountIds(user.id);
    if (cashAccountIds.length === 0) return NextResponse.json({ items: [], total: 0 });

    const balances = await getAccountBalances(
      user.id,
      { start: sp.get('start'), end: sp.get('end') },
      cashAccountIds,
    );

    const items = balances.map(b => ({ accountId: b.accountId, code: b.code, name: b.name, delta: b.debit - b.credit }));
    const total = items.reduce((t, i) => t + i.delta, 0);
    return NextResponse.json({ items, total });
  } catch (e) {
    console.error('Cash Flow GET failed', e);
    return NextResponse.json({ error: 'Failed to load cash flow' }, { status: 500 });
  }
}
