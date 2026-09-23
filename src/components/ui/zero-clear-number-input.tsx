'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ZeroClearNumberInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'type' | 'onFocus' | 'onBlur'
> & {
  value: number;
  onChange: (value: number) => void;
  /** Form value treated as unset (shown muted, cleared on focus). Default 0. */
  emptyNumeric?: number;
  /** String shown when value equals `emptyNumeric`. Default '0'. */
  emptyDisplay?: string;
  /** Parse input as integer instead of float. */
  integer?: boolean;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
};

function toDisplayValue(value: number, emptyNumeric: number, emptyDisplay: string): string {
  if (value === emptyNumeric) {
    return emptyDisplay;
  }
  return String(value);
}

export function ZeroClearNumberInput({
  value,
  onChange,
  emptyNumeric = 0,
  emptyDisplay = '0',
  integer = false,
  className,
  onFocus,
  onBlur,
  ...props
}: ZeroClearNumberInputProps) {
  const isFocusedRef = useRef(false);
  const [displayValue, setDisplayValue] = useState(() =>
    toDisplayValue(value, emptyNumeric, emptyDisplay),
  );

  useEffect(() => {
    if (isFocusedRef.current) {
      return;
    }
    setDisplayValue(toDisplayValue(value, emptyNumeric, emptyDisplay));
  }, [value, emptyNumeric, emptyDisplay]);

  const parseRaw = (raw: string): number => {
    if (raw === '') {
      return emptyNumeric;
    }
    const parsed = integer ? parseInt(raw, 10) : parseFloat(raw);
    if (Number.isNaN(parsed)) {
      return emptyNumeric;
    }
    return parsed;
  };

  return (
    <Input
      type="number"
      {...props}
      className={cn(displayValue === emptyDisplay ? 'text-gray-400' : '', className)}
      value={displayValue}
      onChange={(e) => {
        const raw = e.target.value;
        setDisplayValue(raw);
        onChange(parseRaw(raw));
      }}
      onFocus={(e) => {
        isFocusedRef.current = true;
        if (e.target.value === emptyDisplay) {
          setDisplayValue('');
        }
        onFocus?.(e);
      }}
      onBlur={(e) => {
        isFocusedRef.current = false;
        if (e.target.value === '') {
          setDisplayValue(emptyDisplay);
          onChange(emptyNumeric);
        } else {
          const parsed = parseRaw(e.target.value);
          setDisplayValue(toDisplayValue(parsed, emptyNumeric, emptyDisplay));
          onChange(parsed);
        }
        onBlur?.(e);
      }}
    />
  );
}
