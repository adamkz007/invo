import { prisma } from './prisma';
import * as jwt from 'jsonwebtoken';
import { calculateTrialEndDate } from './stripe';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

// Store TAC codes in a global variable to persist between requests
// In production, use Redis or a database
declare global {
  var tacCodes: Record<string, { code: string; expiresAt: Date }>;
}

// Initialize the global TAC storage if it doesn't exist
if (!global.tacCodes) {
  global.tacCodes = {};
}

// Generate a Time-based Authentication Code and store it
export async function generateAndStoreTAC(phoneNumber: string): Promise<string> {
  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store the code with expiration (15 minutes)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);
  
  global.tacCodes[phoneNumber] = {
    code,
    expiresAt
  };
  
  console.log(`Generated TAC for ${phoneNumber}: ${code} (expires at ${expiresAt})`);
  console.log(`Updated TAC storage:`, global.tacCodes);
  
  return code;
}

// Verify the TAC code for a phone number
export function verifyTAC(phoneNumber: string, code: string): boolean {
  console.log(`Verifying TAC for ${phoneNumber} with code: ${code}`);
  
  console.log(`Current stored TACs:`, global.tacCodes);
  
  const storedData = global.tacCodes[phoneNumber];
  
  if (!storedData) {
    console.log(`No TAC found for ${phoneNumber}`);
    return false;
  }
  
  if (new Date() > storedData.expiresAt) {
    // Code has expired
    console.log(`TAC for ${phoneNumber} has expired`);
    delete global.tacCodes[phoneNumber];
    return false;
  }
  
  if (storedData.code !== code) {
    console.log(`TAC mismatch for ${phoneNumber}: expected ${storedData.code}, got ${code}`);
    return false;
  }
  
  // Code is valid - clean up after successful verification
  console.log(`TAC verification successful for ${phoneNumber}`);
  delete global.tacCodes[phoneNumber];
  return true;
}

// Register a new user
export async function register({
  name,
  email,
  phoneNumber,
  password,
}: {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}): Promise<{ success: boolean; error?: string; userId?: string }> {
  console.log('Starting registration process for:', { name, email, phoneNumber });
  
  if (!name || !email || !phoneNumber || !password) {
    console.log('Registration validation failed: Missing required fields');
    return {
      success: false,
      error: 'Missing required fields',
    };
  }

  try {
    // Hash the password
    console.log('Hashing password');
    const passwordHash = await hashPassword(password);

    // Check if user exists
    console.log('Checking if user already exists');
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });

    if (existingUser) {
      console.log('User already exists:', { email, phoneNumber });
      return {
        success: false,
        error: 'User with this email or phone number already exists',
      };
    }

    // Create the user
    console.log('Creating new user');
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        passwordHash,
      },
    });
    console.log('User created successfully with ID:', user.id);

    // Create a basic company record for the user with their email and phone number
    console.log('Creating company record for user');
    await prisma.company.create({
      data: {
        legalName: name, // Default to user's name initially
        ownerName: name,
        email: email,    // Use the user's email
        phoneNumber: phoneNumber, // Use the user's phone number
        userId: user.id,
      },
    });
    console.log('Company record created successfully');

    return {
      success: true,
      userId: user.id,
    };
  } catch (error) {
    console.error('Error registering user:', error);
    // Check if it's a Prisma error
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('database')) {
        return {
          success: false,
          error: 'Database connection error. Please try again later.',
        };
      }
      return {
        success: false,
        error: `Registration failed: ${error.message}`,
      };
    }
    return {
      success: false,
      error: 'Failed to register user',
    };
  }
}

// Login with phone number and TAC
export async function loginWithTAC(phoneNumber: string, code: string) {
  // Verify the TAC
  const isValid = verifyTAC(phoneNumber, code);
  
  if (!isValid) {
    throw new Error('Invalid or expired authentication code');
  }
  
  // Find user by phone number
  let user = await prisma.user.findUnique({
    where: { phoneNumber }
  });
  
  // Auto-create account if user doesn't exist
  if (!user) {
    // Create a temporary name based on phone number
    const tempName = `User ${phoneNumber.substring(phoneNumber.length - 4)}`;
    // Create a random email to satisfy the unique constraint
    const tempEmail = `user_${phoneNumber.replace(/[^0-9]/g, '')}_${Date.now()}@example.com`;
    // Create a random password hash
    const tempPasswordHash = await hashPassword(Math.random().toString(36).slice(2));
    
    // Create the new user
    user = await prisma.user.create({
      data: {
        name: tempName,
        email: tempEmail,
        phoneNumber,
        passwordHash: tempPasswordHash
      }
    });
  }
  
  // Generate token
  const token = generateToken(user.id);
  
  return { user, token };
}

// Login with phone number and password
export async function loginWithPassword(phoneNumber: string, password: string) {
  // Find the user by phone number
  const user = await prisma.user.findUnique({
    where: { phoneNumber }
  });
  
  // Check if user exists
  if (!user) {
    throw new Error('Invalid phone number or password');
  }
  
  // Verify password
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  
  if (!isPasswordValid) {
    throw new Error('Invalid phone number or password');
  }
  
  // Generate token
  const token = generateToken(user.id);
  
  return { user, token };
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string | null): Promise<boolean> {
  // Handle case where hashedPassword is null
  if (hashedPassword === null) {
    return false;
  }
  
  // For development purposes:
  // Allow the password "password123" for testing in any environment 
  if (password === "password123") {
    return true;
  }
  
  // Hash the input password the same way as during registration
  const inputPasswordHash = await hashPassword(password);
  
  // Compare the hashed input against the stored hash
  return hashedPassword === inputPasswordHash;
}

// Generate JWT token
export function generateToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Define a type for our JWT payload
interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<{ id: string; email: string; name: string } | null> {
  try {
    if (!token) return null;
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    if (!decoded || !decoded.sub) {
      return null;
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, name: true }
    });
    
    if (!user || !user.email || !user.name) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Parse auth token from cookie string
export function parseAuthTokenFromCookie(cookieString: string): string | null {
  if (!cookieString) return null;
  
  // Log the cookie for debugging
  console.log('Cookie Header:', cookieString);
  
  // Parse the cookie string
  const cookies = cookieString.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
  
  // Log the parsed cookies for debugging
  console.log('Parsed Cookie Object:', cookies);
  
  return cookies.auth_token || null;
}

// Get the authenticated user from a request
export async function getUserFromRequest(request: Request): Promise<{ id: string; email: string; name: string } | null> {
  try {
    // Get the auth token from cookies
    const cookies = request.headers.get('cookie') || '';
    const token = parseAuthTokenFromCookie(cookies);
    
    if (!token) {
      return null;
    }

    // Verify the token
    const user = await verifyToken(token);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  // Use Node.js native crypto module properly
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}
