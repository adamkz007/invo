import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// POST /api/auth/login - Login with OTP
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
    
    // Create a Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Verify OTP and sign in with Supabase
    const { data: authData, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: tac,
      type: 'sms',
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!authData.user) {
      throw new Error('Authentication failed');
    }
    
    // Check if user exists in our database
    let user = await prisma.user.findFirst({
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
      
      // Check if company exists for this user
      const existingCompany = await prisma.company.findUnique({
        where: { userId: user.id }
      });
      
      // Create company if it doesn't exist
      if (!existingCompany) {
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
    }
    
    // Create a response with the user data and session
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      },
      session: authData.session
    });
    
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: error.message || 'Authentication failed' 
    }, { 
      status: 401 
    });
  }
}

// Request a verification code
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
  } catch (error: any) {
    console.error('Verification request error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate authentication code' 
    }, { 
      status: 500 
    });
  }
}
