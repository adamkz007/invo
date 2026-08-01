import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/auth';
import { z } from 'zod';
import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '@/lib/rate-limit';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`register:${ip}`, AUTH_RATE_LIMITS.register);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  try {
    const body = await request.json();

    try {
      const { name, email, phoneNumber, password } = registerSchema.parse(body);
      const result = await register({ name, email, phoneNumber, password });

      if (result.success) {
        return NextResponse.json(
          {
            success: true,
            message: 'User registered successfully',
            userId: result.userId,
          },
          { status: 201 },
        );
      }

      return NextResponse.json(
        { success: false, error: result.error || 'Failed to register user' },
        { status: 400 },
      );
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`,
        );
        return NextResponse.json(
          { success: false, error: 'Validation error', details: errorMessages },
          { status: 400 },
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ success: false, error: 'Failed to register user' }, { status: 500 });
  }
}
