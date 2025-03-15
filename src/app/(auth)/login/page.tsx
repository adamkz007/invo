'use client';

import { useState } from 'react';
import RequestTACForm from '@/components/auth/request-tac-form';
import LoginVerificationForm from '@/components/auth/login-verification-form';
import Link from 'next/link';

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
          <h1 className="text-3xl font-bold">INVX</h1>
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
