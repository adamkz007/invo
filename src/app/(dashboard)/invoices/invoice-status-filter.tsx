'use client';

import { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export const INVOICE_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

interface InvoiceStatusFilterProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

function getStatusFilterLabel(selected: string[]) {
  if (selected.length === 0 || selected.length === INVOICE_STATUS_OPTIONS.length) {
    return 'All statuses';
  }

  if (selected.length === 1) {
    return INVOICE_STATUS_OPTIONS.find((option) => option.value === selected[0])?.label ?? '1 status';
  }

  return `${selected.length} statuses`;
}

export function InvoiceStatusFilter({ selected, onChange }: InvoiceStatusFilterProps) {
  const [open, setOpen] = useState(false);

  const toggleStatus = (status: string, checked: boolean) => {
    onChange(checked ? [...selected, status] : selected.filter((value) => value !== status));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*="text-"])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
          )}
        >
          <span className="truncate">{getStatusFilterLabel(selected)}</span>
          <ChevronDownIcon className="size-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-1"
      >
        {INVOICE_STATUS_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value);

          return (
            <label
              key={option.value}
              className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => toggleStatus(option.value, checked === true)}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
