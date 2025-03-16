import { NextRequest, NextResponse } from 'next/server';
import { generateAndStoreTAC } from '@/lib/auth';

// Local method that doesn't rely on database
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
    
    // Generate TAC without checking database
    const tac = await generateAndStoreTAC(phoneNumber);
    
    // In a real application, this would send an SMS
    console.log(`TAC for ${phoneNumber}: ${tac}`);
    
    // For development, return the TAC directly in the response
    return NextResponse.json({
      success: true,
      data: {
        message: 'TAC sent successfully',
        // In development mode, return the TAC code directly
        ...(process.env.NODE_ENV !== 'production' && { tac }),
        // Always assume user exists to bypass database check
        userExists: true
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
