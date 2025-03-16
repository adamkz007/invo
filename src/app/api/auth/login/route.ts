import { NextRequest, NextResponse } from 'next/server';
import { verifyTAC, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/auth/login - Login with TAC
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { phoneNumber, tac } = data;
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    if (!tac) {
      return NextResponse.json({ error: 'Authentication code is required' }, { status: 400 });
    }
    
    // Verify TAC without database dependency
    const isValid = verifyTAC(phoneNumber, tac);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired authentication code' }, { status: 401 });
    }
    
    // Look up the user in the database
    let user = await prisma.user.findUnique({
      where: { phoneNumber }
    });
    
    // If user doesn't exist, create a new one
    if (!user) {
      // Create a temporary name based on phone number
      const tempName = `User ${phoneNumber.substring(phoneNumber.length - 4)}`;
      // Create a random email to satisfy the unique constraint
      const tempEmail = `user_${phoneNumber.replace(/[^0-9]/g, '')}_${Date.now()}@example.com`;
      // Create a random password hash
      const tempPasswordHash = await prisma.user.findFirst().then(u => u?.passwordHash || 'defaulthash');
      
      // Create the new user
      user = await prisma.user.create({
        data: {
          name: tempName,
          email: tempEmail,
          phoneNumber,
          passwordHash: tempPasswordHash
        }
      });
    }
    
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
    
    // Generate token with the actual user ID
    const token = generateToken(user.id);
    
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
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }, { 
      status: 401 
    });
  }
}

// Request a TAC code
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { phoneNumber } = data;
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    // Forward to the dedicated request-tac endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/auth/request-tac`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber })
    });
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('TAC request error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate authentication code' 
    }, { 
      status: 500 
    });
  }
}
