import { NextRequest, NextResponse } from 'next/server';
import { prisma, testConnection } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// In-memory storage for company details during development
let mockCompanyStorage: Record<string, any> = {
  // Default company for user ID '1'
  '1': {
    id: 'mock-company-1',
    legalName: 'Demo Company LLC',
    ownerName: 'Demo User',
    registrationNumber: 'REG123456',
    taxIdentificationNumber: 'TAX123456',
    email: 'contact@democompany.com',
    phoneNumber: '123-456-7890',
    address: '123 Business Ave, Commerce City, USA',
    termsAndConditions: 'Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.',
    logoUrl: null,
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Maximum number of database connection retries
const MAX_RETRIES = 5;

// Helper function to retry database operations
async function retryDatabaseOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Database operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      // Wait a bit before retrying, with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 500 * (MAX_RETRIES - retries + 1)));
      return retryDatabaseOperation(operation, retries - 1);
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    const isConnected = await testConnection().catch(() => false);
    
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
    
    // If database is connected, try to use it first
    if (isConnected) {
      try {
        // Fetch company details for this user with retry logic
        const company = await retryDatabaseOperation(() => 
          prisma.company.findUnique({
            where: {
              userId: userId
            }
          })
        );
        
        // If no company details exist yet, return an empty response
        if (!company) {
          // Check if we have mock data
          if (mockCompanyStorage[userId]) {
            return NextResponse.json(mockCompanyStorage[userId]);
          }
          return NextResponse.json(null);
        }
        
        return NextResponse.json(company);
      } catch (dbError) {
        console.error('Database error, falling back to mock storage:', dbError);
      }
    } else {
      console.log('Database not connected, using mock storage');
    }
    
    // Fall back to mock storage
    if (mockCompanyStorage[userId]) {
      return NextResponse.json(mockCompanyStorage[userId]);
    }
    
    return NextResponse.json(null);
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
    
    // Test database connection first
    const isConnected = await testConnection().catch(() => false);
    
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
    
    // If database is connected, try to use it first
    if (isConnected) {
      try {
        // Check if company details already exist for this user
        const existingCompany = await retryDatabaseOperation(() => 
          prisma.company.findUnique({
            where: {
              userId: userId
            }
          })
        );
        
        let company;
        
        if (existingCompany) {
          // Update existing company details
          company = await retryDatabaseOperation(() => 
            prisma.company.update({
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
                termsAndConditions: data.termsAndConditions,
              }
            })
          );
        } else {
          // Create new company details
          company = await retryDatabaseOperation(() => 
            prisma.company.create({
              data: {
                legalName: data.legalName,
                ownerName: data.ownerName,
                registrationNumber: data.registrationNumber,
                taxIdentificationNumber: data.taxIdentificationNumber,
                email: data.email,
                phoneNumber: data.phoneNumber,
                address: data.address,
                termsAndConditions: data.termsAndConditions,
                user: {
                  connect: { id: userId }
                }
              }
            })
          );
        }
        
        return NextResponse.json(company);
      } catch (dbError) {
        console.error('Database error, using mock storage instead:', dbError);
      }
    } else {
      console.log('Database not connected, using mock storage');
    }
    
    // Fall back to mock storage
    const mockCompany = {
      id: `mock-company-${userId}`,
      legalName: data.legalName || 'Demo Company LLC',
      ownerName: data.ownerName || 'Demo User',
      registrationNumber: data.registrationNumber || 'REG123456',
      taxIdentificationNumber: data.taxIdentificationNumber || 'TAX123456',
      email: data.email || 'contact@democompany.com',
      phoneNumber: data.phoneNumber || '123-456-7890',
      address: data.address || '123 Business Ave, Commerce City, USA',
      termsAndConditions: data.termsAndConditions || 'Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.',
      logoUrl: null,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store in mock storage
    mockCompanyStorage[userId] = mockCompany;
    
    console.log('Saved company details to mock storage:', mockCompany);
    
    return NextResponse.json(mockCompany);
  } catch (error) {
    console.error('Error saving company details:', error);
    return NextResponse.json({ 
      error: 'Failed to save company details' 
    }, { 
      status: 500 
    });
  }
} 