'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define country codes with flags
const countryCodes = [
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
  { code: '+856', country: 'Laos', flag: '🇱🇦' },
];

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
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  
  // Handle phone number input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-digit characters
    const phoneNumber = e.target.value.replace(/\D/g, '');
    
    // Combine country code with phone number
    const fullNumber = `${selectedCountry.code}${phoneNumber}`;
    onChange(fullNumber);
  };
  
  // Extract the phone number without country code for display
  const displayValue = value.startsWith(selectedCountry.code)
    ? value.substring(selectedCountry.code.length)
    : value;
  
  // Handle country selection
  const handleCountrySelect = (country: typeof countryCodes[0]) => {
    setSelectedCountry(country);
    
    // If there's a phone number, update the full number with the new country code
    if (displayValue) {
      const fullNumber = `${country.code}${displayValue}`;
      onChange(fullNumber);
    }
    
    setOpen(false);
  };

  return (
    <div className={cn("flex", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-[110px] justify-between border-r-0 rounded-r-none"
          >
            <span className="flex items-center gap-1">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.code}</span>
            </span>
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {countryCodes.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.country} ${country.code}`}
                  onSelect={() => handleCountrySelect(country)}
                  className="flex items-center gap-2"
                >
                  <span>{country.flag}</span>
                  <span>{country.country}</span>
                  <span className="text-muted-foreground">{country.code}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedCountry.code === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        value={displayValue}
        onChange={handlePhoneChange}
        disabled={disabled}
        placeholder={placeholder}
        className="rounded-l-none"
      />
    </div>
  );
} 