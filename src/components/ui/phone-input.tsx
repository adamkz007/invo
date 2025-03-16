'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define Malaysia country code with flag
const malaysiaCountry = { code: '+60', country: 'Malaysia', flag: '🇲🇾' };

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  placeholder = 'Enter your phone number',
  className,
}: PhoneInputProps) {
  // Handle phone number input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-digit characters
    const phoneNumber = e.target.value.replace(/\D/g, '');
    
    // Combine country code with phone number
    const fullNumber = `${malaysiaCountry.code}${phoneNumber}`;
    onChange(fullNumber);
  };
  
  // Extract the phone number without country code for display
  const displayValue = value.startsWith(malaysiaCountry.code)
    ? value.substring(malaysiaCountry.code.length)
    : value;

  // Validate input to only allow digits
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, and navigation keys
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];
    
    // Allow control combinations for copy, paste, etc.
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }
    
    if (allowedKeys.includes(e.key)) {
      return;
    }
    
    // Ensure that it is a number and stop the keypress if not
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("flex", className)}>
      <Button
        variant="outline"
        disabled={disabled}
        className="w-[110px] justify-between border-r-0 rounded-r-none"
      >
        <span className="flex items-center gap-1">
          <span>{malaysiaCountry.flag}</span>
          <span>{malaysiaCountry.code}</span>
        </span>
      </Button>
      <Input
        type="tel"
        value={displayValue}
        onChange={handlePhoneChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="rounded-l-none"
        inputMode="numeric"
        pattern="[0-9]*"
      />
    </div>
  );
} 