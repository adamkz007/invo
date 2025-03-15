import { prisma } from './db';
import { hashPassword } from './utils';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

// Store TAC codes temporarily (in production, use Redis or similar)
const tacCodes: Record<string, { code: string; expiresAt: Date }> = {};

// Generate a Time-based Authentication Code and store it
export async function generateAndStoreTAC(phoneNumber: string): Promise<string> {
  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store the code with expiration (15 minutes)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);
  
  tacCodes[phoneNumber] = {
    code,
    expiresAt
  };
  
  console.log(`Generated TAC for ${phoneNumber}: ${code} (expires at ${expiresAt})`);
  console.log(`Updated TAC storage:`, tacCodes);
  
  return code;
}

// Verify the TAC code for a phone number
export function verifyTAC(phoneNumber: string, code: string): boolean {
  console.log(`Verifying TAC for ${phoneNumber} with code: ${code}`);
  
  // For development only: Allow a special test code '123456' for any phone number
  // IMPORTANT: Remove this in production environments
  if (process.env.NODE_ENV !== 'production' && code === '123456') {
    console.log(`Using development test code for ${phoneNumber}`);
    return true;
  }
  
  console.log(`Current stored TACs:`, tacCodes);
  
  const storedData = tacCodes[phoneNumber];
  
  if (!storedData) {
    console.log(`No TAC found for ${phoneNumber}`);
    return false;
  }
  
  if (new Date() > storedData.expiresAt) {
    // Code has expired
    console.log(`TAC for ${phoneNumber} has expired`);
    delete tacCodes[phoneNumber];
    return false;
  }
  
  if (storedData.code !== code) {
    console.log(`TAC mismatch for ${phoneNumber}: expected ${storedData.code}, got ${code}`);
    return false;
  }
  
  // Code is valid - clean up after successful verification
  console.log(`TAC verification successful for ${phoneNumber}`);
  delete tacCodes[phoneNumber];
  return true;
}

// Register a new user
export async function registerUser(name: string, email: string, phoneNumber: string, password: string) {
  // Check if user with this phone number or email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { phoneNumber },
        { email }
      ]
    }
  });
  
  if (existingUser) {
    throw new Error('User with this phone number or email already exists');
  }
  
  // Hash the password
  const passwordHash = await hashPassword(password);
  
  // Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phoneNumber,
      passwordHash
    }
  });
  
  // Generate token
  const token = generateToken(user.id);
  
  return { user, token };
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

// Generate JWT token
export function generateToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
