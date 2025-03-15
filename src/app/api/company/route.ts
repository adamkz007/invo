import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    // Default to a demo user ID if no token is found
    let userId = '1'; // Default user ID for demo purposes
    
    // If token exists, verify it and extract the user ID
    if (token) {
      try {
        const decoded = await verifyToken(token);
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
    
    // Fetch company details for this user
    const company = await prisma.company.findUnique({
      where: {
        userId: userId
      }
    });
    
    // If no company details exist yet, return an empty response
    if (!company) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch company details' 
    }, { 
      status: 500 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    // Default to a demo user ID if no token is found
    let userId = '1'; // Default user ID for demo purposes
    
    // If token exists, verify it and extract the user ID
    if (token) {
      try {
        const decoded = await verifyToken(token);
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
    
    // Check if company details already exist for this user
    const existingCompany = await prisma.company.findUnique({
      where: {
        userId: userId
      }
    });
    
    let company;
    
    if (existingCompany) {
      // Update existing company details
      company = await prisma.company.update({
        where: {
          userId: userId
        },
        data: {
          legalName: data.legalName,
          ownerName: data.ownerName,
          registrationNumber: data.registrationNumber,
          taxIdentificationNumber: data.taxIdentificationNumber,
          email: data.email,
          phoneNumber: data.phoneNumber,
          address: data.address,
        }
      });
    } else {
      // Create new company details
      company = await prisma.company.create({
        data: {
          legalName: data.legalName,
          ownerName: data.ownerName,
          registrationNumber: data.registrationNumber,
          taxIdentificationNumber: data.taxIdentificationNumber,
          email: data.email,
          phoneNumber: data.phoneNumber,
          address: data.address,
          user: {
            connect: { id: userId }
          }
        }
      });
    }
    
    return NextResponse.json(company);
  } catch (error) {
    console.error('Error saving company details:', error);
    return NextResponse.json({ 
      error: 'Failed to save company details' 
    }, { 
      status: 500 
    });
  }
} 