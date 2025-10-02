'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useTheme } from 'next-themes';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  // Add theme hook to detect dark mode
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md rounded-lg border p-8 shadow-md relative">
        <Link href="/" className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 flex items-center gap-1.5 text-sm bg-gray-100 px-2.5 py-1.5 rounded-md transition-colors hover:bg-gray-200">
          <ArrowLeft className="h-4 w-4" />
          <LayoutDashboard className="h-4 w-4" />
          <span>Home</span>
        </Link>
        
        <div className="mb-6 text-center">
          <div className="flex justify-center items-center">
            <Image 
              src={isDarkMode ? "/invo-logo-w.png" : "/invo-logo.png"} 
              alt="Invo Logo" 
              width={40} 
              height={40} 
              className="mr-2"
            />
            <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : ""}`}>Invo</h1>
          </div>
        </div>

        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90',
              },
            }}
            afterSignUpUrl="/dashboard"
            signInUrl="/sign-in"
          />
        </div>

        <div className="mt-6 text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}