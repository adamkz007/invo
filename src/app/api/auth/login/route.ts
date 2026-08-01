import { NextRequest, NextResponse } from 'next/server';
import {
  verifyTAC,
  generateToken,
  verifyPassword,
} from '@/lib/auth';
import { upgradePasswordHashIfNeeded } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`login:${ip}`, AUTH_RATE_LIMITS.login);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  try {
    const data = await request.json();

    if (data.phoneNumber && data.tac) {
      return handleTacLogin(data.phoneNumber, data.tac);
    }

    if (data.email && data.password) {
      return handleEmailPasswordLogin(data.email, data.password);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid authentication method. Provide either phoneNumber+tac or email+password',
      },
      { status: 400 },
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
      },
      { status: 401 },
    );
  }
}

async function handleTacLogin(phoneNumber: string, tac: string) {
  if (!phoneNumber) {
    return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
  }

  if (!tac) {
    return NextResponse.json({ success: false, error: 'Authentication code is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Phone number is not registered' },
      { status: 401 },
    );
  }

  const isValid = verifyTAC(phoneNumber, tac);
  if (!isValid) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired authentication code' },
      { status: 401 },
    );
  }

  return createAuthResponse(user);
}

async function handleEmailPasswordLogin(email: string, password: string) {
  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: 'Email and password are required' },
      { status: 400 },
    );
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user && /^\+?\d+$/.test(email)) {
    user = await prisma.user.findUnique({ where: { phoneNumber: email } });
  }

  if (!user) {
    return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
  }

  await upgradePasswordHashIfNeeded(
    user.id,
    password,
    user.passwordHash,
    async (userId, passwordHash) => {
      await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    },
  );

  return createAuthResponse(user);
}

function createAuthResponse(user: {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
}) {
  const token = generateToken(user.id);

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
  });

  response.cookies.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export async function PUT(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`request-tac:${ip}`, AUTH_RATE_LIMITS.requestTac);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  try {
    const data = await request.json();
    const { phoneNumber } = data;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const response = await fetch(`${request.nextUrl.origin}/api/auth/request-tac`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('TAC request error:', error);
    return NextResponse.json({ error: 'Failed to generate authentication code' }, { status: 500 });
  }
}
