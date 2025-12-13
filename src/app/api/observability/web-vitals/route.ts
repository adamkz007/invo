import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ status: 'ignored' }, { status: 400 });
    }

    const { name, value, label, id, startTime } = payload as {
      name?: string;
      value?: number;
      label?: string;
      id?: string;
      startTime?: number;
    };

    console.info('[web-vitals]', {
      name,
      value,
      label,
      id,
      startTime,
      ts: Date.now(),
    });

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('web-vitals ingestion failed', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

