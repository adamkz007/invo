import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TACInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TACInput({ value, onChange, disabled = false, className }: TACInputProps) {
  const [tacValues, setTacValues] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  // Update internal state when external value changes
  useEffect(() => {
    if (value) {
      const chars = value.split('').slice(0, 6);
      const newValues = Array(6).fill('');
      chars.forEach((char, index) => {
        newValues[index] = char;
      });
      setTacValues(newValues);
    } else {
      setTacValues(Array(6).fill(''));
    }
  }, [value]);

  // Update parent component when internal state changes
  useEffect(() => {
    const combinedValue = tacValues.join('');
    if (combinedValue !== value) {
      onChange(combinedValue);
    }
  }, [tacValues, onChange, value]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only allow digits
    if (newValue && !/^\d*$/.test(newValue)) {
      return;
    }

    // Handle paste or multiple characters
    if (newValue.length > 1) {
      const chars = newValue.split('');
      const newValues = [...tacValues];
      
      // Fill current and subsequent inputs
      for (let i = 0; i < chars.length && i + index < 6; i++) {
        newValues[i + index] = chars[i];
      }
      
      setTacValues(newValues);
      
      // Focus on the next empty input or the last one
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Handle single character
    const newValues = [...tacValues];
    newValues[index] = newValue;
    setTacValues(newValues);

    // Auto-focus next input if current one is filled
    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !tacValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Move to next input on right arrow
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Move to previous input on left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits) {
      const newValues = [...tacValues];
      digits.split('').forEach((digit, index) => {
        if (index < 6) {
          newValues[index] = digit;
        }
      });
      setTacValues(newValues);
      
      // Focus on the next empty input or the last one
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex justify-between gap-2", className)}>
      {tacValues.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "h-12 w-12 rounded-md border text-center text-lg font-semibold",
            "focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
            disabled ? "bg-muted text-muted-foreground" : "",
          )}
        />
      ))}
    </div>
  );
} 