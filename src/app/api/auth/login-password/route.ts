import { NextRequest, NextResponse } from 'next/server';
import { loginWithPassword, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`login-password:${ip}`, AUTH_RATE_LIMITS.login);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  try {
    const data = await request.json();
    const { phoneNumber, password } = data;

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const { user, token } = await loginWithPassword(phoneNumber, password);

    const existingCompany = await prisma.company.findUnique({ where: { userId: user.id } });

    if (existingCompany) {
      if (!existingCompany.phoneNumber) {
        await prisma.company.update({
          where: { userId: user.id },
          data: { phoneNumber },
        });
      }
    } else {
      await prisma.company.create({
        data: {
          legalName: `${user.name}'s Business`,
          ownerName: user.name ?? 'Owner',
          phoneNumber,
          user: { connect: { id: user.id } },
        },
      });
    }

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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid phone number or password' },
      { status: 401 },
    );
  }
}
