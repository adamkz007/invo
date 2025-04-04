'use client';

import SignUpForm from '@/components/auth/signup-form';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SignUpPage() {
  // Add theme hook to detect dark mode
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md rounded-lg border p-8 shadow-md relative">
        <Link href="/" className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 flex items-center text-sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
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
