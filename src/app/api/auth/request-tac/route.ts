import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    
    // Create a Supabase client (without cookies for this specific API endpoint)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Request phone verification via Supabase
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    
    if (error) {
      console.error('Phone verification request error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to send verification code'
        },
        { status: 500 }
      );
    }
    
    // For development, log the phone number
    console.log(`Verification code requested for ${phoneNumber}`);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Verification code sent successfully',
        userExists: true
      }
    });
  } catch (error: any) {
    console.error('Error requesting verification code:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send verification code'
      },
      { status: 500 }
    );
  }
}
