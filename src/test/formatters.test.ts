import { describe, it, expect } from 'vitest';
import {
  formatMonthYear,
  formatCurrency,
  formatPeriod,
  formatFrequency,
  formatRate,
} from '../utils/formatters';

describe('formatMonthYear', () => {
  it('formats a standard date correctly', () => {
    expect(formatMonthYear('2026-01-15')).toBe('Jan 2026');
  });

  it('formats December correctly', () => {
    expect(formatMonthYear('2025-12-01')).toBe('Dec 2025');
  });

  it('formats February correctly', () => {
    expect(formatMonthYear('2025-02-28')).toBe('Feb 2025');
  });

  it('formats March 2026 correctly', () => {
    expect(formatMonthYear('2026-03-22')).toBe('Mar 2026');
  });

  it('returns original string for invalid date', () => {
    const invalid = 'not-a-date';
    expect(formatMonthYear(invalid)).toBe(invalid);
  });

  it('formats a far future date correctly', () => {
    expect(formatMonthYear('2030-07-01')).toBe('Jul 2030');
  });
});

describe('formatCurrency', () => {
  it('formats MDL correctly', () => {
    expect(formatCurrency(1000, 'MDL')).toBe('1,000.00 MDL');
  });

  it('formats EUR correctly', () => {
    expect(formatCurrency(1500.5, 'EUR')).toBe('1,500.50 EUR');
  });

  it('formats USD correctly', () => {
    expect(formatCurrency(2500.99, 'USD')).toBe('2,500.99 USD');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0, 'MDL')).toBe('0.00 MDL');
  });

  it('formats large amount correctly', () => {
    expect(formatCurrency(1000000, 'MDL')).toBe('1,000,000.00 MDL');
  });

  it('always shows 2 decimal places', () => {
    expect(formatCurrency(100, 'USD')).toBe('100.00 USD');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(9.999, 'EUR')).toBe('10.00 EUR');
  });
});

describe('formatPeriod', () => {
  it('formats 6 months', () => {
    expect(formatPeriod(6)).toBe('6 months');
  });

  it('formats 12 months', () => {
    expect(formatPeriod(12)).toBe('12 months');
  });

  it('formats 18 months', () => {
    expect(formatPeriod(18)).toBe('18 months');
  });

  it('formats 24 months', () => {
    expect(formatPeriod(24)).toBe('24 months');
  });

  it('formats 36 months', () => {
    expect(formatPeriod(36)).toBe('36 months');
  });

  it('formats 60 months', () => {
    expect(formatPeriod(60)).toBe('60 months');
  });
});

describe('formatFrequency', () => {
  it('formats monthly correctly', () => {
    expect(formatFrequency('monthly')).toBe('Monthly');
  });

  it('formats biannual correctly', () => {
    expect(formatFrequency('biannual')).toBe('Biannual');
  });

  it('formats annual correctly', () => {
    expect(formatFrequency('annual')).toBe('Annual');
  });
});

describe('formatRate', () => {
  it('formats integer rate with 2 decimals', () => {
    expect(formatRate(8)).toBe('8.00%');
  });

  it('formats decimal rate correctly', () => {
    expect(formatRate(8.5)).toBe('8.50%');
  });

  it('formats two-decimal rate correctly', () => {
    expect(formatRate(12.75)).toBe('12.75%');
  });

  it('formats zero rate correctly', () => {
    expect(formatRate(0)).toBe('0.00%');
  });

  it('formats 100% correctly', () => {
    expect(formatRate(100)).toBe('100.00%');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatRate(8.999)).toBe('9.00%');
  });
});
