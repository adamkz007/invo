import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getAccountBalances } from '@/lib/accounting/balances';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const asOf = req.nextUrl.searchParams.get('date');

  try {
    const items = await getAccountBalances(user.id, { end: asOf });

    const assets = items.filter(i => i.type === 'ASSET').map(i => ({ ...i, balance: i.debit - i.credit }));
    const liabilities = items.filter(i => i.type === 'LIABILITY').map(i => ({ ...i, balance: i.credit - i.debit }));
    const equity = items.filter(i => i.type === 'EQUITY').map(i => ({ ...i, balance: i.credit - i.debit }));

    const totalAssets = assets.reduce((t, a) => t + a.balance, 0);
    const totalLiabilities = liabilities.reduce((t, a) => t + a.balance, 0);
    const totalEquity = equity.reduce((t, a) => t + a.balance, 0);

    return NextResponse.json({ assets, liabilities, equity, totals: { assets: totalAssets, liabilities: totalLiabilities, equity: totalEquity } });
  } catch (e) {
    console.error('Balance Sheet GET failed', e);
    return NextResponse.json({ error: 'Failed to load balance sheet' }, { status: 500 });
  }
}
