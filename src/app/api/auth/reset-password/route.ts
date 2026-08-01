import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`reset-password:${ip}`, AUTH_RATE_LIMITS.login);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is required' },
        { status: 400 },
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 },
      );
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'Password must contain both letters and numbers' },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!dbUser?.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Unable to verify current password' },
        { status: 400 },
      );
    }

    const isCurrentValid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 },
      );
    }

    const newHashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHashedPassword },
    });

    const freshToken = generateToken(user.id);
    const response = NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });

    response.cookies.set({
      name: 'auth_token',
      value: freshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 });
  }
}
