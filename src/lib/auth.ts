import { randomInt } from 'crypto';
import { Prisma } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { calculateTrialEndDate } from './stripe';
import { getJwtSecret } from './env';
import {
  hashPassword,
  verifyPassword,
  upgradePasswordHashIfNeeded,
} from './password';

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = '7d';
const DEBUG_AUTH = process.env.DEBUG_AUTH === 'true';
const TAC_MAX_ATTEMPTS = 5;
const TAC_LOCKOUT_MS = 15 * 60 * 1000;

declare global {
  var tacCodes: Record<string, { code: string; expiresAt: Date }>;
  var tacAttempts: Record<string, { count: number; lockedUntil?: Date }>;
}

if (!global.tacCodes) {
  global.tacCodes = {};
}

if (!global.tacAttempts) {
  global.tacAttempts = {};
}

function debugLog(...args: unknown[]) {
  if (DEBUG_AUTH) {
    console.log(...args);
  }
}

function isPhoneLocked(phoneNumber: string): boolean {
  const attempts = global.tacAttempts[phoneNumber];
  if (!attempts?.lockedUntil) {
    return false;
  }
  if (new Date() > attempts.lockedUntil) {
    delete global.tacAttempts[phoneNumber];
    return false;
  }
  return true;
}

function recordFailedTacAttempt(phoneNumber: string): void {
  const existing = global.tacAttempts[phoneNumber] ?? { count: 0 };
  const count = existing.count + 1;

  if (count >= TAC_MAX_ATTEMPTS) {
    global.tacAttempts[phoneNumber] = {
      count,
      lockedUntil: new Date(Date.now() + TAC_LOCKOUT_MS),
    };
    return;
  }

  global.tacAttempts[phoneNumber] = { count };
}

function clearTacAttempts(phoneNumber: string): void {
  delete global.tacAttempts[phoneNumber];
}

export async function generateAndStoreTAC(phoneNumber: string): Promise<string> {
  if (isPhoneLocked(phoneNumber)) {
    throw new Error('Too many failed attempts. Please try again later.');
  }

  const code = randomInt(100000, 1000000).toString();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  global.tacCodes[phoneNumber] = { code, expiresAt };
  debugLog(`TAC generated for ${phoneNumber} (expires at ${expiresAt.toISOString()})`);

  return code;
}

export function verifyTAC(phoneNumber: string, code: string): boolean {
  if (isPhoneLocked(phoneNumber)) {
    return false;
  }

  const storedData = global.tacCodes[phoneNumber];
  if (!storedData) {
    recordFailedTacAttempt(phoneNumber);
    return false;
  }

  if (new Date() > storedData.expiresAt) {
    delete global.tacCodes[phoneNumber];
    recordFailedTacAttempt(phoneNumber);
    return false;
  }

  if (storedData.code !== code) {
    recordFailedTacAttempt(phoneNumber);
    return false;
  }

  delete global.tacCodes[phoneNumber];
  clearTacAttempts(phoneNumber);
  return true;
}

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
  if (!name || !email || !phoneNumber || !password) {
    return { success: false, error: 'Missing required fields' };
  }

  try {
    const trialStartDate = new Date();
    const trialEndDate = calculateTrialEndDate(trialStartDate);
    const passwordHash = await hashPassword(password);

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email or phone number already exists',
      };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        passwordHash,
        subscriptionStatus: 'TRIAL',
        trialStartDate,
        trialEndDate,
      },
    });

    await prisma.company.create({
      data: {
        legalName: name,
        ownerName: name,
        email,
        phoneNumber,
        userId: user.id,
      },
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Error registering user:', error);
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('database')) {
        return { success: false, error: 'Database connection error. Please try again later.' };
      }
      if (process.env.NODE_ENV !== 'production') {
        return { success: false, error: `Registration failed: ${error.message}` };
      }
    }
    return { success: false, error: 'Failed to register user' };
  }
}

export async function loginWithPassword(phoneNumber: string, password: string) {
  const user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) {
    throw new Error('Invalid phone number or password');
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid phone number or password');
  }

  await upgradePasswordHashIfNeeded(
    user.id,
    password,
    user.passwordHash,
    async (userId, passwordHash) => {
      await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    },
  );

  const token = generateToken(user.id);
  return { user, token };
}

export { verifyPassword, hashPassword, upgradePasswordHashIfNeeded } from './password';

export function generateToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

function isPrismaAuthLookupError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  );
}

export async function verifyToken(
  token: string,
): Promise<{ id: string; email: string; name: string; phoneNumber: string | null } | null> {
  try {
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded?.sub) return null;

    let user: {
      id: string;
      email: string | null;
      name: string | null;
      phoneNumber: string | null;
    } | null = null;

    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, name: true, phoneNumber: true },
      });
    } catch (error) {
      if (isPrismaAuthLookupError(error)) return null;
      throw error;
    }

    if (!user?.email || !user.name) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
    };
  } catch (error) {
    debugLog('Token verification error:', error);
    return null;
  }
}

export function parseAuthTokenFromCookie(cookieString: string): string | null {
  if (!cookieString) return null;

  const cookies = cookieString.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );

  return cookies.auth_token || null;
}

export async function getUserFromRequest(
  request: Request,
): Promise<{ id: string; email: string; name: string } | null> {
  try {
    const cookies = request.headers.get('cookie') || '';
    const token = parseAuthTokenFromCookie(cookies);
    if (!token) return null;

    const user = await verifyToken(token);
    if (!user) return null;

    return { id: user.id, email: user.email, name: user.name };
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}
