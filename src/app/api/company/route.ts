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
    street: '123 Business Ave',
    addressLine1: '123 Business Ave',
    postcode: '50000',
    city: 'Commerce City',
    state: 'Kuala Lumpur',
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
            // Ensure mock data has address fields parsed
            const parsedMockCompany = parseAddress(mockCompanyStorage[userId]);
            return NextResponse.json(parsedMockCompany);
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
      // Ensure mock data has address fields parsed
      const parsedMockCompany = parseAddress(mockCompanyStorage[userId]);
      return NextResponse.json(parsedMockCompany);
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
                street: data.addressLine1 || data.street,
                city: data.city,
                postcode: data.postcode,
                state: data.state,
                country: data.country || 'Malaysia',
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
                street: data.addressLine1 || data.street,
                city: data.city,
                postcode: data.postcode,
                state: data.state,
                country: data.country || 'Malaysia',
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
      street: data.street || data.addressLine1 || '123 Business Ave',
      addressLine1: data.addressLine1 || data.street || '123 Business Ave',
      postcode: data.postcode || '50000',
      city: data.city || 'Commerce City',
      state: data.state || 'Kuala Lumpur',
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
  // If no street/addressLine1 data is available, return existing address
  if (!data.street && !data.addressLine1) {
    return data.address || '';
  }
  
  // Use street if available, otherwise use addressLine1
  const streetAddress = data.street || data.addressLine1;
  
  // Build address parts array
  const addressParts = [streetAddress];
  
  // Add city and postcode
  let locationPart = '';
  if (data.postcode || data.city) {
    locationPart = `${data.postcode || ''} ${data.city || ''}`.trim();
  }
  
  // Add state if available
  if (data.state) {
    locationPart = locationPart ? `${locationPart}, ${data.state}` : data.state;
  }
  
  // Add country if available
  if (data.country) {
    locationPart = locationPart ? `${locationPart}, ${data.country}` : data.country;
  }
  
  if (locationPart) {
    addressParts.push(locationPart);
  }
  
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
  // If company already has all separate fields, return it as is
  if (company.street && company.city && company.postcode) {
    return company;
  }
  
  // If company has addressLine1 but not street, use addressLine1 as street
  if (company.addressLine1 && !company.street) {
    company.street = company.addressLine1;
  }
  
  // If company already has separate fields but not addressLine1, set it for backward compatibility
  if (company.street && !company.addressLine1) {
    company.addressLine1 = company.street;
  }
  
  // If company has all separate fields but not address, we don't need to parse
  if (company.street && company.city && company.postcode) {
    // Ensure address is set for backward compatibility
    if (!company.address) {
      company.address = formatAddress(company);
    }
    return company;
  }
  
  const address = company.address || '';
  
  // Split by comma to get address parts
  const addressParts = address.split(',').map((part: string) => part.trim());
  
  // Need at least 2 parts: street and location (postcode city, country)
  if (addressParts.length < 2) {
    return {
      ...company,
      street: company.street || addressParts[0] || '',
      addressLine1: company.addressLine1 || addressParts[0] || '',
      postcode: company.postcode || '',
      city: company.city || '',
      state: company.state || '',
      country: company.country || 'Malaysia'
    };
  }
  
  // Get street from first part
  const street = company.street || addressParts[0];
  const addressLine1 = company.addressLine1 || addressParts[0];
  
  // Try to parse the postcode, city and country from the second part
  const locationPart = addressParts[1];
  
  // Split location by commas to separate country
  const locationParts = locationPart.split(',').map((part: string) => part.trim());
  
  let postcode = company.postcode || '';
  let city = company.city || '';
  let state = company.state || '';
  let country = company.country || 'Malaysia';
  
  if (locationParts.length > 1) {
    // Last part is country
    country = company.country || locationParts[locationParts.length - 1] || 'Malaysia';
    
    // Everything else is city and postcode
    const cityPostcodePart = locationParts[0];
    
    // Try to extract postcode (assuming it's numeric and at the beginning)
    const postcodeMatch = cityPostcodePart.match(/^(\d+)/);
    if (postcodeMatch) {
      postcode = company.postcode || postcodeMatch[0];
      city = company.city || cityPostcodePart.replace(postcodeMatch[0], '').trim();
    } else {
      city = company.city || cityPostcodePart;
    }
    
    // If there's a middle part, it might be the state
    if (locationParts.length > 2) {
      state = company.state || locationParts[1];
    }
  } else {
    // No comma in location, assume it's just postcode + city
    const cityPostcodePart = locationPart;
    
    // Try to extract postcode (assuming it starts with numbers)
    const postcodeMatch = cityPostcodePart.match(/^(\d+)/);
    if (postcodeMatch) {
      postcode = company.postcode || postcodeMatch[0];
      city = company.city || cityPostcodePart.replace(postcodeMatch[0], '').trim();
    } else {
      city = company.city || cityPostcodePart;
    }
  }
  
  return {
    ...company,
    street: street,
    addressLine1: addressLine1 || '',
    postcode: postcode || '',
    city: city || '',
    state: state || '',
    country: country || 'Malaysia'
  };
}