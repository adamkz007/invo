'use client';

import { useState } from 'react';
import RequestTACForm from '@/components/auth/request-tac-form';
import LoginVerificationForm from '@/components/auth/login-verification-form';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [step, setStep] = useState<'request-tac' | 'verify'>('request-tac');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const handleRequestTACSuccess = (phoneNumber: string) => {
    setPhoneNumber(phoneNumber);
    setStep('verify');
  };

  const handleBackToRequest = () => {
    setStep('request-tac');
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md rounded-lg border p-8 shadow-md">
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

        {step === 'request-tac' ? (
          <RequestTACForm onSuccess={handleRequestTACSuccess} isLogin={true} />
        ) : (
          <LoginVerificationForm 
            phoneNumber={phoneNumber}
            onBack={handleBackToRequest}
          />
        )}

        <div className="mt-6 text-center text-sm">
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
