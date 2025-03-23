import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { register } from '@/lib/auth';

// Registration schema
const registerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type RegisterData = z.infer<typeof registerSchema>;

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    try {
      const { name, email, phoneNumber, password } = registerSchema.parse(body);
      
      // Call the register function with validated data
      const result = await register({ name, email, phoneNumber, password });
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'User registered successfully',
          userId: result.userId
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: result.error || 'Registration failed' 
        }, { status: 400 });
      }
      
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: validationError.errors[0].message },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
