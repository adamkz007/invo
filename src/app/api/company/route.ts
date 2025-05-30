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
    address: '123 Business Ave, Commerce City, Malaysia',
    addressLine1: '123 Business Ave',
    postcode: '50000',
    city: 'Commerce City',
    country: 'Malaysia',
    termsAndConditions: 'Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.',
    paymentMethod: 'bank',
    bankAccountName: 'Demo Company LLC',
    bankName: 'Demo Bank',
    bankAccountNumber: '1234567890',
    qrImageUrl: null,
    logoUrl: null,
    msicCode: '00000',
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
        
        // Parse address into separate fields if they don't exist
        const parsedCompany = parseAddress(company);
        
        return NextResponse.json(parsedCompany);
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
    
    // Format address from separate fields if they exist
    const combinedAddress = formatAddress(data);
    
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
                address: combinedAddress,
                termsAndConditions: data.termsAndConditions,
                paymentMethod: data.paymentMethod,
                bankAccountName: data.bankAccountName,
                bankName: data.bankName,
                bankAccountNumber: data.bankAccountNumber,
                qrImageUrl: data.qrImageUrl,
                msicCode: data.msicCode,
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
                address: combinedAddress,
                termsAndConditions: data.termsAndConditions,
                paymentMethod: data.paymentMethod,
                bankAccountName: data.bankAccountName,
                bankName: data.bankName,
                bankAccountNumber: data.bankAccountNumber,
                qrImageUrl: data.qrImageUrl,
                msicCode: data.msicCode,
                user: {
                  connect: { id: userId }
                }
              }
            })
          );
        }
        
        // Return the company data with both formats (single address and separate fields)
        const responseCompany = {
          ...company,
          addressLine1: data.addressLine1 || '',
          postcode: data.postcode || '',
          city: data.city || '',
          country: data.country || 'Malaysia',
        };
        
        // Log data for debugging
        console.log('Responding with company details:', {
          addressFields: {
            addressLine1: data.addressLine1,
            postcode: data.postcode,
            city: data.city
          },
          response: {
            addressLine1: responseCompany.addressLine1,
            postcode: responseCompany.postcode,
            city: responseCompany.city
          }
        });
        
        return NextResponse.json(responseCompany);
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
      address: combinedAddress || '123 Business Ave, Commerce City, Malaysia',
      addressLine1: data.addressLine1 || '123 Business Ave',
      postcode: data.postcode || '50000',
      city: data.city || 'Commerce City',
      country: data.country || 'Malaysia',
      termsAndConditions: data.termsAndConditions || 'Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.',
      paymentMethod: data.paymentMethod || 'bank',
      bankAccountName: data.bankAccountName || 'Demo Company LLC',
      bankName: data.bankName || 'Demo Bank',
      bankAccountNumber: data.bankAccountNumber || '1234567890',
      qrImageUrl: data.qrImageUrl || null,
      logoUrl: null,
      msicCode: data.msicCode || '00000',
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

// Format address from separate fields into a single combined address
function formatAddress(data: any): string {
  if (!data.addressLine1) {
    return data.address || '';
  }
  
  // Format address with addressLine1 and a combined line for postcode, city, country
  const addressParts = [
    data.addressLine1,
    `${data.postcode || ''} ${data.city || ''}${data.country ? ', ' + data.country : ''}`
  ];
  
  // Join with comma, then clean up any consecutive commas or trailing commas
  let formattedAddress = addressParts.join(', ');
  
  // Replace consecutive commas and spaces (from empty fields)
  formattedAddress = formattedAddress.replace(/,\s*,+/g, ',');
  
  // Remove any leading/trailing commas and trim spaces
  formattedAddress = formattedAddress.replace(/^,+|,+$/g, '').trim();
  
  return formattedAddress;
}

// Parse a single address string into separate fields
function parseAddress(company: any): any {
  if (company.addressLine1) {
    return company; // Already has separate fields
  }
  
  const address = company.address || '';
  
  // Split by comma to get address parts
  const addressParts = address.split(',').map((part: string) => part.trim());
  
  // Need at least 2 parts: addressLine1 and location (postcode city, country)
  if (addressParts.length < 2) {
    return {
      ...company,
      addressLine1: addressParts[0] || '',
      postcode: '',
      city: '',
      country: 'Malaysia'
    };
  }
  
  // Get addressLine1 from first part
  const addressLine1 = addressParts[0];
  
  // Try to parse the postcode, city and country from the second part
  const locationPart = addressParts[1];
  
  // Split location by commas to separate country
  const locationParts = locationPart.split(',').map((part: string) => part.trim());
  
  let postcode = '';
  let city = '';
  let country = 'Malaysia';
  
  if (locationParts.length > 1) {
    // If location has comma, the last part is country
    country = locationParts[locationParts.length - 1] || 'Malaysia';
    
    // The first part contains postcode and city
    const cityPostcodePart = locationParts[0];
    
    // Try to extract postcode (assuming it starts with numbers)
    const postcodeMatch = cityPostcodePart.match(/^(\d+)/);
    if (postcodeMatch) {
      postcode = postcodeMatch[0];
      city = cityPostcodePart.replace(postcode, '').trim();
    } else {
      city = cityPostcodePart;
    }
  } else {
    // No comma in location, assume it's just postcode + city
    const cityPostcodePart = locationPart;
    
    // Try to extract postcode (assuming it starts with numbers)
    const postcodeMatch = cityPostcodePart.match(/^(\d+)/);
    if (postcodeMatch) {
      postcode = postcodeMatch[0];
      city = cityPostcodePart.replace(postcode, '').trim();
    } else {
      city = cityPostcodePart;
    }
  }
  
  return {
    ...company,
    addressLine1: addressLine1 || '',
    postcode: postcode || '',
    city: city || '',
    country: country || 'Malaysia'
  };
} 