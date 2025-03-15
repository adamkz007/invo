import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    console.log('Cookies in request:', req.cookies.getAll());
    
    // Get the token from cookies
    const token = req.cookies.get('auth_token')?.value;
    console.log('Auth token from cookies:', token ? 'Found' : 'Not found');
    
    if (!token) {
      console.log('No auth token found in cookies');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify the token and get user
    const user = await verifyToken(token);
    
    return NextResponse.json({
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
  } catch (error) {
    console.error('Error checking authentication:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed'
      },
      { status: 401 }
    );
  }
}
