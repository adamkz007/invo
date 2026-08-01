import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '@/lib/rate-limit';

const MAX_BODY_BYTES = 2048;

const webVitalsSchema = z.object({
  name: z.string().max(32),
  value: z.number().finite(),
  label: z.string().max(32).optional(),
  id: z.string().max(128).optional(),
  startTime: z.number().finite().optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`web-vitals:${ip}`, AUTH_RATE_LIMITS.webVitals);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ status: 'ignored' }, { status: 413 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ status: 'ignored' }, { status: 400 });
    }

    const parsed = webVitalsSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ status: 'ignored' }, { status: 400 });
    }

    if (process.env.DEBUG_AUTH === 'true') {
      console.info('[web-vitals]', parsed.data);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('web-vitals ingestion failed', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
