import { NextRequest, NextResponse } from 'next/server';
import { loginWithPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/auth/login-password - Login with phone number and password
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { phoneNumber, password } = data;
    
    if (!phoneNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone number is required' 
      }, { status: 400 });
    }
    
    if (!password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password is required' 
      }, { status: 400 });
    }
    
    // Attempt to login with password
    const { user, token } = await loginWithPassword(phoneNumber, password);
    
    // Check if company exists for this user
    const existingCompany = await prisma.company.findUnique({
      where: { userId: user.id }
    });
    
    // Create or update company with the phone number
    if (existingCompany) {
      // Only update if phone number is not already set
      if (!existingCompany.phoneNumber) {
        await prisma.company.update({
          where: { userId: user.id },
          data: { phoneNumber }
        });
      }
    } else {
      // Create a new company record with minimal information
      await prisma.company.create({
        data: {
          legalName: `${user.name}'s Business`,
          ownerName: user.name,
          phoneNumber,
          user: {
            connect: { id: user.id }
          }
        }
      });
    }
    
    // Create a response with the user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
    
    // Set the auth token cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // 7 days expiry
      maxAge: 60 * 60 * 24 * 7
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }, { 
      status: 401 
    });
  }
} 