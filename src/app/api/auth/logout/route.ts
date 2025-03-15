import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Create a response
  const response = NextResponse.json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
  
  // Clear the auth cookie
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: false, // Match the login route setting
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Setting expiry to the past to delete the cookie
    path: '/',
    sameSite: 'lax', // Match the login route setting
  });
  
  console.log('Cleared auth_token cookie');
  
  return response;
}
