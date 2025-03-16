import { supabase } from './supabase';
import { prisma } from './prisma';

// Request a phone verification code
export async function requestPhoneVerification(phoneNumber: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Phone verification request error:', error);
    throw error;
  }
}

// Verify phone with OTP and sign in
export async function verifyPhoneAndSignIn(phoneNumber: string, otp: string) {
  try {
    // Verify the OTP
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms',
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Authentication failed');
    }

    // Check if user exists in our database
    let user = await prisma.user.findFirst({
      where: { phoneNumber }
    });

    // If user doesn't exist, create a new one
    if (!user) {
      // Create a temporary name based on phone number
      const tempName = `User ${phoneNumber.substring(phoneNumber.length - 4)}`;
      // Create a random email to satisfy the unique constraint
      const tempEmail = `user_${phoneNumber.replace(/[^0-9]/g, '')}_${Date.now()}@example.com`;
      // Create a random password hash
      const tempPasswordHash = await prisma.user.findFirst().then(u => u?.passwordHash || 'defaulthash');
      
      // Create the new user
      user = await prisma.user.create({
        data: {
          name: tempName,
          email: tempEmail,
          phoneNumber,
          passwordHash: tempPasswordHash
        }
      });

      // Check if company exists for this user
      const existingCompany = await prisma.company.findUnique({
        where: { userId: user.id }
      });
      
      // Create company if it doesn't exist
      if (!existingCompany) {
        await prisma.company.create({
          data: {
            legalName: `${user.name}'s Business`,
            ownerName: user.name,
            phoneNumber,
            user: {
              connect: { id: user.id }
            }
          }
        });
      }
    }

    return { 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      },
      session: data.session
    };
  } catch (error: any) {
    console.error('Phone verification error:', error);
    throw error;
  }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
  return { success: true };
}

// Get current session
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return data.session;
}

// Get current user
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }
  return data.user;
} 