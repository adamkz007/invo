import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    // Verify token and get the current user
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json();
    const { newPassword } = body;
    if (!newPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'New password is required' 
      }, { status: 400 });
    }
    // Validate that the new password meets requirements
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }
    // Check for alphanumeric (contains both letters and numbers)
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must contain both letters and numbers' 
      }, { status: 400 });
    }
    // Hash the new password
    const newHashedPassword = await hashPassword(newPassword);
    // Update the user's password in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHashedPassword }
    });
    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update password'
    }, { status: 500 });
  }
} 