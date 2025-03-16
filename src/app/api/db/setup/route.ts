import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    // Check if this is a production environment
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: false,
        message: 'This endpoint is only available in production'
      }, { status: 403 });
    }

    // Run Prisma migrations
    try {
      await execAsync('npx prisma migrate deploy');
      console.log('Migrations applied successfully');
    } catch (error) {
      console.error('Error applying migrations:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to apply migrations',
        error: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }

    // Test database connection
    try {
      // Simple query to test connection
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('Database connection successful:', result);
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to connect to database',
        error: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully'
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 