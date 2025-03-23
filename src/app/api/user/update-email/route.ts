import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

// Email validation schema
const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' })
});

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from request
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    
    try {
      const { email } = emailSchema.parse(body);
      
      // Check if email is already in use by another user
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 400 }
        );
      }
      
      // Update user's email
      await prisma.user.update({
        where: { id: user.id },
        data: { email }
      });
      
      return NextResponse.json({ success: true });
      
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: validationError.errors[0].message },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    );
  }
} 