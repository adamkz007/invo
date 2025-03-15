import { NextRequest, NextResponse } from 'next/server';
import { loginWithTAC } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Log the entire request body for debugging
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate the request
    if (!body.phoneNumber || !body.tac) {
      console.log('Missing phone number or TAC:', body);
      return NextResponse.json(
        { success: false, error: 'Phone number and TAC are required' },
        { status: 400 }
      );
    }
    
    const { phoneNumber, tac } = body;
    
    // Login with phone number and TAC
    let user, token;
    try {
      const result = await loginWithTAC(phoneNumber, tac);
      user = result.user;
      token = result.token;
    } catch (loginError) {
      console.error('Login error:', loginError);
      return NextResponse.json(
        { 
          success: false, 
          error: loginError instanceof Error ? loginError.message : 'Login failed' 
        },
        { status: 401 }
      );
    }
    
    // Set the token as a cookie with explicit headers
    const response = NextResponse.json({
      success: true,
      data: { 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          phoneNumber: user.phoneNumber 
        } 
      }
    });
    
    // Set cookie with explicit headers
    response.headers.append('Set-Cookie', 
      `auth_token=${token}; HttpOnly=false; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
    );
    
    // Additional logging to track cookie setting
    console.log('Setting auth_token cookie with explicit headers:', {
      token,
      headers: response.headers.get('Set-Cookie')
    });
    
    return response;
  } catch (error: any) {
    // Catch-all error handler with detailed logging
    console.error('Unexpected error during login:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during login',
        details: error.message || 'No additional error details'
      },
      { status: 500 }
    );
  }
}
