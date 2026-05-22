"use client"

import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export type PeriodOption = 'MTD' | 'QTD' | 'YTD' | 'Last 30 Days' | 'Last 90 Days' | 'This Year' | 'Last Year' | 'Custom' | 'All Time';

const PERIOD_OPTIONS: PeriodOption[] = ['MTD', 'QTD', 'YTD', 'Last 30 Days', 'Last 90 Days', 'This Year', 'Last Year', 'Custom', 'All Time'];

interface PeriodSelectorProps {
  period: PeriodOption;
  onPeriodChange: (p: PeriodOption) => void;
  customFrom?: string;
  customTo?: string;
  onCustomFromChange?: (v: string) => void;
  onCustomToChange?: (v: string) => void;
}

export function usePeriodDates(period: PeriodOption, customFrom?: string, customTo?: string) {
  return useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (period) {
      case 'MTD':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfToday };
      case 'QTD': {
        const q = Math.floor(now.getMonth() / 3) * 3;
        return { start: new Date(now.getFullYear(), q, 1), end: endOfToday };
      }
      case 'YTD':
        return { start: new Date(now.getFullYear(), 0, 1), end: endOfToday };
      case 'Last 30 Days': {
        const s = new Date(now);
        s.setDate(s.getDate() - 29);
        s.setHours(0, 0, 0, 0);
        return { start: s, end: endOfToday };
      }
      case 'Last 90 Days': {
        const s = new Date(now);
        s.setDate(s.getDate() - 89);
        s.setHours(0, 0, 0, 0);
        return { start: s, end: endOfToday };
      }
      case 'This Year':
        return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999) };
      case 'Last Year':
        return { start: new Date(now.getFullYear() - 1, 0, 1), end: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999) };
      case 'Custom':
        return {
          start: customFrom ? new Date(customFrom) : undefined,
          end: customTo ? new Date(customTo + 'T23:59:59.999') : undefined,
        };
      case 'All Time':
      default:
        return { start: undefined, end: undefined };
    }
  }, [period, customFrom, customTo]);
}

export function getPeriodLabel(period: PeriodOption, customFrom?: string, customTo?: string) {
  if (period === 'Custom') {
    const from = customFrom || '...';
    const to = customTo || '...';
    return `${from} to ${to}`;
  }
  if (period === 'All Time') return 'All Time';
  return period;
}

export function PeriodSelector({ period, onPeriodChange, customFrom, customTo, onCustomFromChange, onCustomToChange }: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={period} onValueChange={(v) => onPeriodChange(v as PeriodOption)}>
        <SelectTrigger className="w-[140px] sm:w-[160px]">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {period === 'Custom' && (
        <>
          <Input
            type="date"
            value={customFrom || ''}
            onChange={(e) => onCustomFromChange?.(e.target.value)}
            className="w-[140px]"
          />
          <Input
            type="date"
            value={customTo || ''}
            onChange={(e) => onCustomToChange?.(e.target.value)}
            className="w-[140px]"
          />
        </>
      )}
    </div>
  );
}
