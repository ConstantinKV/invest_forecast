import { format, parseISO } from 'date-fns';
import type { Investment } from '../types';

export function formatMonthYear(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number, currency: Investment['currency']): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export function formatPeriod(months: number): string {
  return `${months} months`;
}

export function formatFrequency(freq: Investment['interestFrequency']): string {
  switch (freq) {
    case 'monthly':
      return 'Monthly';
    case 'biannual':
      return 'Biannual';
    case 'annual':
      return 'Annual';
  }
}

export function formatRate(rate: number): string {
  return `${rate.toFixed(2)}%`;
}
