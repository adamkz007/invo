import { NextRequest, NextResponse } from 'next/server';
import { generateAndStoreTAC } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request
    if (!body.phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    const phoneNumber = body.phoneNumber;
    
    // Check if the user exists (for login)
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber }
    });
    
    // Generate TAC
    const tac = await generateAndStoreTAC(phoneNumber);
    
    // In a real application, this would send an SMS
    console.log(`TAC for ${phoneNumber}: ${tac}`);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'TAC sent successfully',
        userExists: !!existingUser
      }
    });
  } catch (error) {
    console.error('Error requesting TAC:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send TAC'
      },
      { status: 500 }
    );
  }
}
