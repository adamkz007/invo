import { NextRequest, NextResponse } from 'next/server';
import { generateAndStoreTAC } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 },
      );
    }

    const phoneNumber = body.phoneNumber;

    const ip = getClientIp(req);
    const ipLimit = checkRateLimit(`request-tac:${ip}`, AUTH_RATE_LIMITS.requestTac);
    if (!ipLimit.allowed) {
      return rateLimitResponse(ipLimit.retryAfterSeconds);
    }

    const phoneLimit = checkRateLimit(
      `request-tac:phone:${phoneNumber}`,
      AUTH_RATE_LIMITS.requestTac,
    );
    if (!phoneLimit.allowed) {
      return rateLimitResponse(phoneLimit.retryAfterSeconds);
    }

    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Phone number is not registered' },
        { status: 404 },
      );
    }

    await generateAndStoreTAC(phoneNumber);

    return NextResponse.json({
      success: true,
      data: {
        message: 'TAC sent successfully',
        userExists: true,
      },
    });
  } catch (error) {
    console.error('Error requesting TAC:', error);
    const message =
      error instanceof Error && error.message.includes('Too many failed attempts')
        ? error.message
        : 'Failed to send TAC';

    return NextResponse.json({ success: false, error: message }, { status: 429 });
  }
}
