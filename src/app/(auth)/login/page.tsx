'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RequestTACForm from '@/components/auth/request-tac-form';
import LoginVerificationForm from '@/components/auth/login-verification-form';
import LoginPasswordForm from '@/components/auth/login-password-form';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Create a client component that uses useSearchParams
function LoginContent() {
  const [step, setStep] = useState<'request-tac' | 'verify' | 'password'>('request-tac');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if redirected from successful signup or password reset
    const status = searchParams.get('status');
    if (status === 'signup_success') {
      setShowSuccessMessage(true);
      // Set custom success message
      setSuccessMessage("All set! Login to your account now.");
      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (status === 'password_reset') {
      setShowSuccessMessage(true);
      // Set custom success message for password reset
      setSuccessMessage("Password reset successful! Please login again.");
      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleRequestTACSuccess = (phoneNumber: string) => {
    setPhoneNumber(phoneNumber);
    setStep('verify');
  };

  const handleBackToRequest = () => {
    setStep('request-tac');
  };
  
  const handleSwitchToPassword = () => {
    setStep('password');
  };
  
  const handleSwitchToTAC = () => {
    setStep('request-tac');
  };

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
              src="/invo-logo.png" 
              alt="Invo Logo" 
              width={40} 
              height={40} 
              className="mr-2"
            />
            <h1 className="text-3xl font-bold">Invo</h1>
          </div>
          <p className="text-sm text-muted-foreground">Invoice Management Made Simple</p>
        </div>
        
        {showSuccessMessage && (
          <div className="mb-4 p-3 rounded-md bg-green-50 text-green-800 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p>{successMessage}</p>
          </div>
        )}

        {step === 'request-tac' && (
          <>
            <RequestTACForm onSuccess={handleRequestTACSuccess} isLogin={true} initialPhoneNumber={phoneNumber} />
            <div className="text-center mt-4">
              <Button 
                variant="link" 
                onClick={handleSwitchToPassword} 
                className="text-sm text-muted-foreground"
              >
                Login with password instead
              </Button>
            </div>
          </>
        )}
        
        {step === 'verify' && (
          <LoginVerificationForm 
            phoneNumber={phoneNumber}
            onBack={handleBackToRequest}
          />
        )}
        
        {step === 'password' && (
          <>
            <LoginPasswordForm initialPhoneNumber={phoneNumber} />
            <div className="text-center mt-4">
              <Button 
                variant="link" 
                onClick={handleSwitchToTAC} 
                className="text-sm text-muted-foreground"
              >
                Login with verification code instead
              </Button>
            </div>
          </>
        )}

        <div className="mt-6 text-center text-sm">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading component to show while suspense is active
function LoginLoading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md rounded-lg border p-8 shadow-md">
        <div className="mb-6 text-center">
          <div className="flex justify-center items-center">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse mr-2"></div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="mt-2 h-4 w-48 bg-gray-100 rounded mx-auto animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-10 bg-primary/30 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
