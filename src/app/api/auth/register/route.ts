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
    
    // Validate password requirements
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Check for alphanumeric (contains both letters and numbers)
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must contain both letters and numbers' },
        { status: 400 }
      );
    }
    
    // Register the user
    const { user } = await registerUser(name, email, phoneNumber, password);
    
    // Create a response without setting the auth token cookie
    const response = NextResponse.json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email, phoneNumber: user.phoneNumber } }
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
