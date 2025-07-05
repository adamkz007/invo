'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getMsicCodes, MSICCode } from '@/lib/msic-codes';

interface MSICCodeSearchProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MSICCodeSearch({ value, onChange, disabled }: MSICCodeSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [msicCodes, setMsicCodes] = React.useState<MSICCode[]>([]);
  const [loading, setLoading] = React.useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLoading(true);
    getMsicCodes().then((codes) => {
      setMsicCodes(codes);
      setLoading(false);
    });
  }, []);

  // Debug logging
  React.useEffect(() => {
    console.log('Current MSIC code value:', value);
  }, [value]);

  const selectedCode = msicCodes.find((code) => code.code === value);

  // Filter codes based on search query
  const filteredCodes = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return msicCodes.filter(code => 
      code.code.toLowerCase().includes(query) ||
      code.description.toLowerCase().includes(query) ||
      (code.category && code.category.toLowerCase().includes(query))
    );
  }, [searchQuery, msicCodes]);

  // Group codes by category
  const groupedCodes = React.useMemo(() => {
    const groups: { [key: string]: MSICCode[] } = {};
    filteredCodes.forEach(code => {
      const category = code.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(code);
    });
    return groups;
  }, [filteredCodes]);

  // Focus input when opening popover
  React.useEffect(() => {
    if (open && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {selectedCode ? (
            <span className="flex items-center">
              <span className="font-medium">{selectedCode.code}</span>
              <span className="mx-2">-</span>
              <span className="truncate">{selectedCode.description}</span>
            </span>
          ) : (
            loading ? 'Loading MSIC codes...' : 'Select MSIC code...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            ref={inputRef}
            placeholder="Search by code, description, or category..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            disabled={loading}
          />
          <CommandEmpty>{loading ? 'Loading MSIC codes...' : 'No MSIC code found.'}</CommandEmpty>
          <div className="max-h-[300px] overflow-y-auto">
            {Object.entries(groupedCodes).map(([category, codes]) => (
              <CommandGroup key={category} heading={category}>
                {codes.map((code, idx) => {
                  // Create custom selection handler for each item
                  const handleItemSelect = () => {
                    console.log('Item selected:', code.code);
                    onChange(code.code);
                    setOpen(false);
                    setSearchQuery('');
                  };
                  return (
                    <div 
                      key={code.code + '-' + idx}
                      onClick={handleItemSelect}
                      className={cn(
                        "flex items-center px-2 py-1.5 text-sm rounded-sm relative",
                        "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        value === code.code ? "bg-accent text-accent-foreground" : ""
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === code.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <span className="font-medium">{code.code}</span>
                        <span className="mx-2">-</span>
                        <span className="text-muted-foreground">{code.description}</span>
                      </div>
                    </div>
                  );
                })}
              </CommandGroup>
            ))}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 