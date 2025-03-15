'use client';

import SignUpForm from '@/components/auth/signup-form';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md rounded-lg border p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">INVX</h1>
          <p className="text-sm text-muted-foreground">Invoice Management Made Simple</p>
        </div>

        <SignUpForm />

        <div className="mt-6 text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
