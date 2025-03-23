import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/auth';
import { z } from 'zod';

// Registration schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterData = z.infer<typeof registerSchema>;

export async function POST(request: NextRequest) {
  console.log('Register API route called');
  
  try {
    const body = await request.json();
    console.log('Request body received', { ...body, password: '[REDACTED]' });
    
    try {
      // Validate the data
      const { name, email, phoneNumber, password } = registerSchema.parse(body);
      console.log('Validation passed');
      
      // Call the register function with validated data
      const result = await register({ name, email, phoneNumber, password });
      console.log('Register function result:', { ...result, userId: result.userId ? '[PRESENT]' : '[NOT PRESENT]' });
      
      if (result.success) {
        return NextResponse.json(
          {
            success: true,
            message: 'User registered successfully',
            userId: result.userId,
          },
          { status: 201 }
        );
      } else {
        console.log('Registration failed with error:', result.error);
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Failed to register user',
          },
          { status: 400 }
        );
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.log('Validation error:', validationError.errors);
        const errorMessages = validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: errorMessages,
          },
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
