import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request
    if (!body.name || !body.email || !body.phoneNumber || !body.password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    const { name, email, phoneNumber, password } = body;
    
    // Register the user
    const { user, token } = await registerUser(name, email, phoneNumber, password);
    
    // Create a response with the token in a cookie
    const response = NextResponse.json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email, phoneNumber: user.phoneNumber } }
    });
    
    // Set the token as an HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return response;
  } catch (error: any) {
    console.error('Error during registration:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Registration failed'
      },
      { status: 400 }
    );
  }
}
