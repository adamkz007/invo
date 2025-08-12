import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Middleware to check if the POS module is enabled for the user
 * This is used to protect POS API routes when the module is disabled
 */
export async function posModuleMiddleware(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For server-side API routes, we can't access localStorage directly
    // Instead, we'll use the POS settings table to check if the module is enabled
    const posSettings = await prisma.posSettings.findUnique({
      where: { userId: user.id },
    });

    // If posSettings exists, the module is considered enabled
    // This is because posSettings are only created when the POS module is used
    const isPosEnabled = !!posSettings;

    if (!isPosEnabled) {
      return NextResponse.json(
        { error: 'POS module is disabled. Enable it in Settings.' },
        { status: 403 }
      );
    }

    // Continue with the request if POS module is enabled
    return NextResponse.next();
  } catch (error) {
    console.error('Error in POS module middleware:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}