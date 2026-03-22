import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isFutureInvestment,
  calcYearlyNet,
  calcPerPayment,
  getPaymentMonths,
  calcCurrentMonthIncome,
  calcSummary,
} from '../utils/calculations';
import type { Investment, InvestmentType } from '../types';

// Fixed "today": 2026-03-22
const TODAY = new Date('2026-03-22T00:00:00.000Z');

const bonds: InvestmentType = { id: 'bonds', name: 'Bonds', fee: 0, isDefault: true };
const bankDeposit: InvestmentType = { id: 'bank_deposit', name: 'Bank Deposit', fee: 6, isDefault: true };
const highFee: InvestmentType = { id: 'high_fee', name: 'High Fee', fee: 12, isDefault: false };

function makeInvestment(overrides: Partial<Investment> = {}): Investment {
  return {
    id: 'inv_1',
    startDate: '2026-01-01',
    period: 12,
    interestFrequency: 'monthly',
    investmentTypeId: 'bonds',
    amount: 10000,
    currency: 'MDL',
    interestRate: 8,
    activated: true,
    ...overrides,
  };
}

describe('isFutureInvestment', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for a date in the far future', () => {
    const inv = makeInvestment({ startDate: '2027-01-01' });
    expect(isFutureInvestment(inv)).toBe(true);
  });

  it('returns true for tomorrow', () => {
    const inv = makeInvestment({ startDate: '2026-03-23' });
    expect(isFutureInvestment(inv)).toBe(true);
  });

  it('returns false for today (today is NOT future)', () => {
    const inv = makeInvestment({ startDate: '2026-03-22' });
    expect(isFutureInvestment(inv)).toBe(false);
  });

  it('returns false for a past date', () => {
    const inv = makeInvestment({ startDate: '2025-01-01' });
    expect(isFutureInvestment(inv)).toBe(false);
  });

  it('returns false for a date one year ago', () => {
    const inv = makeInvestment({ startDate: '2025-03-22' });
    expect(isFutureInvestment(inv)).toBe(false);
  });
});

describe('calcYearlyNet', () => {
  it('calculates correctly with fee=0 (bonds)', () => {
    const inv = makeInvestment({ amount: 10000, interestRate: 8 });
    // 10000 * 0.08 * (1 - 0) = 800
    expect(calcYearlyNet(inv, bonds)).toBeCloseTo(800);
  });

  it('calculates correctly with fee=6% (bank deposit)', () => {
    const inv = makeInvestment({ amount: 10000, interestRate: 8 });
    // 10000 * 0.08 * (1 - 0.06) = 800 * 0.94 = 752
    expect(calcYearlyNet(inv, bankDeposit)).toBeCloseTo(752);
  });

  it('calculates correctly with fee=12% (high fee)', () => {
    const inv = makeInvestment({ amount: 10000, interestRate: 8 });
    // 10000 * 0.08 * (1 - 0.12) = 800 * 0.88 = 704
    expect(calcYearlyNet(inv, highFee)).toBeCloseTo(704);
  });

  it('returns 0 for amount=0', () => {
    const inv = makeInvestment({ amount: 0, interestRate: 8 });
    expect(calcYearlyNet(inv, bonds)).toBe(0);
  });

  it('calculates correctly for various amounts and rates', () => {
    const inv = makeInvestment({ amount: 50000, interestRate: 10 });
    // 50000 * 0.10 * 1 = 5000
    expect(calcYearlyNet(inv, bonds)).toBeCloseTo(5000);
  });

  it('calculates correctly for large amount and fee=6%', () => {
    const inv = makeInvestment({ amount: 100000, interestRate: 12 });
    // 100000 * 0.12 * 0.94 = 11280
    expect(calcYearlyNet(inv, bankDeposit)).toBeCloseTo(11280);
  });
});

describe('calcPerPayment', () => {
  it('calculates monthly per payment correctly', () => {
    const inv = makeInvestment({ interestFrequency: 'monthly', amount: 12000, interestRate: 10 });
    const yearlyNet = calcYearlyNet(inv, bonds); // 12000 * 0.10 = 1200
    expect(calcPerPayment(inv, bonds)).toBeCloseTo(yearlyNet / 12); // 100
  });

  it('calculates biannual per payment correctly', () => {
    const inv = makeInvestment({ interestFrequency: 'biannual', amount: 12000, interestRate: 10 });
    const yearlyNet = calcYearlyNet(inv, bonds); // 1200
    expect(calcPerPayment(inv, bonds)).toBeCloseTo(yearlyNet / 2); // 600
  });

  it('calculates annual per payment correctly', () => {
    const inv = makeInvestment({ interestFrequency: 'annual', amount: 12000, interestRate: 10 });
    const yearlyNet = calcYearlyNet(inv, bonds); // 1200
    expect(calcPerPayment(inv, bonds)).toBeCloseTo(yearlyNet); // 1200
  });

  it('monthly with fee', () => {
    const inv = makeInvestment({ interestFrequency: 'monthly', amount: 10000, interestRate: 8 });
    const yearlyNet = calcYearlyNet(inv, bankDeposit); // 752
    expect(calcPerPayment(inv, bankDeposit)).toBeCloseTo(yearlyNet / 12);
  });

  it('biannual with fee', () => {
    const inv = makeInvestment({ interestFrequency: 'biannual', amount: 10000, interestRate: 8 });
    const yearlyNet = calcYearlyNet(inv, bankDeposit); // 752
    expect(calcPerPayment(inv, bankDeposit)).toBeCloseTo(yearlyNet / 2);
  });
});

describe('getPaymentMonths', () => {
  it('monthly: 12-month investment has 12 payments', () => {
    const inv = makeInvestment({ startDate: '2026-01-01', period: 12, interestFrequency: 'monthly' });
    const payments = getPaymentMonths(inv);
    expect(payments).toHaveLength(12);
  });

  it('monthly: payments start 1 month after start and end at period', () => {
    const inv = makeInvestment({ startDate: '2026-01-01', period: 12, interestFrequency: 'monthly' });
    const payments = getPaymentMonths(inv);
    // First payment: Feb 2026 (month index 1), last: Jan 2027 (month index 0)
    expect(payments[0].getFullYear()).toBe(2026);
    expect(payments[0].getMonth()).toBe(1); // February
    expect(payments[11].getFullYear()).toBe(2027);
    expect(payments[11].getMonth()).toBe(0); // January
  });

  it('monthly: 6-month investment has 6 payments', () => {
    const inv = makeInvestment({ startDate: '2026-01-01', period: 6, interestFrequency: 'monthly' });
    const payments = getPaymentMonths(inv);
    expect(payments).toHaveLength(6);
  });

  it('biannual: 12-month investment has 2 payments', () => {
    const inv = makeInvestment({ startDate: '2026-01-01', period: 12, interestFrequency: 'biannual' });
    const payments = getPaymentMonths(inv);
    expect(payments).toHaveLength(2);
  });

  it('biannual: 24-month investment has 4 payments', () => {
    const inv = makeInvestment({ startDate: '2026-01-01', period: 24, interestFrequency: 'biannual' });
    const payments = getPaymentMonths(inv);
    expect(payments).toHaveLength(4);
  });

  it('biannual: payments are 6 months apart', () => {
    const inv = makeInvestment({ startDate: '2026-01-01', period: 12, interestFrequency: 'biannual' });
    const payments = getPaymentMonths(inv);
    // Payment 1: Jul 2026 (month 6), Payment 2: Jan 2027 (month 12)
    expect(payments[0].getMonth()).toBe(6); // July
    expect(payments[1].getMonth()).toBe(0); // January 2027
  });

  it('annual: 12-month investment has 1 payment', () => {
    const inv = makeInvestment({ startDate: '2026-01-01', period: 12, interestFrequency: 'annual' });
    const payments = getPaymentMonths(inv);
    expect(payments).toHaveLength(1);
  });

  it('annual: 24-month investment has 2 payments', () => {
    const inv = makeInvestment({ startDate: '2026-01-01', period: 24, interestFrequency: 'annual' });
    const payments = getPaymentMonths(inv);
    expect(payments).toHaveLength(2);
  });

  it('annual: 36-month investment has 3 payments', () => {
    const inv = makeInvestment({ startDate: '2025-01-01', period: 36, interestFrequency: 'annual' });
    const payments = getPaymentMonths(inv);
    expect(payments).toHaveLength(3);
  });

  it('annual: 6-month investment has 0 payments (period < 12)', () => {
    const inv = makeInvestment({ startDate: '2026-01-01', period: 6, interestFrequency: 'annual' });
    const payments = getPaymentMonths(inv);
    expect(payments).toHaveLength(0);
  });
});

describe('calcCurrentMonthIncome', () => {
  it('returns 0 when no investments have payments this month', () => {
    // Investment starting 2026-03-01 with monthly: payments are Apr, May, ..., Mar 2027
    // So March 2026 has no payment (payment starts 1 month after start)
    const inv = makeInvestment({ startDate: '2026-03-01', period: 12, interestFrequency: 'monthly' });
    // The today passed is March 2026, so we look at month 2 (March)
    // First payment is April 2026 (month 3), so no payment in March 2026
    const result = calcCurrentMonthIncome([inv], [bonds], new Date('2026-03-15'));
    expect(result).toBeCloseTo(0);
  });

  it('returns correct income when investment has monthly payment this month', () => {
    // Investment starting 2026-02-01, monthly, so first payment is March 2026
    const inv = makeInvestment({ startDate: '2026-02-01', period: 12, interestFrequency: 'monthly', amount: 12000, interestRate: 10 });
    const perPayment = calcPerPayment(inv, bonds); // 1200 / 12 = 100
    const result = calcCurrentMonthIncome([inv], [bonds], new Date('2026-03-15'));
    expect(result).toBeCloseTo(perPayment);
  });

  it('includes only investments with payments in current month', () => {
    const invWithPayment = makeInvestment({
      id: 'inv_1',
      startDate: '2026-02-01',
      period: 12,
      interestFrequency: 'monthly',
      amount: 12000,
      interestRate: 10,
    });
    const invWithoutPayment = makeInvestment({
      id: 'inv_2',
      startDate: '2026-03-01',
      period: 12,
      interestFrequency: 'monthly',
      amount: 50000,
      interestRate: 8,
    });
    const perPayment = calcPerPayment(invWithPayment, bonds);
    const result = calcCurrentMonthIncome([invWithPayment, invWithoutPayment], [bonds], new Date('2026-03-15'));
    expect(result).toBeCloseTo(perPayment);
  });

  it('returns 0 when investmentType is not found', () => {
    const inv = makeInvestment({ startDate: '2026-02-01', period: 12, interestFrequency: 'monthly', investmentTypeId: 'unknown' });
    const result = calcCurrentMonthIncome([inv], [bonds], new Date('2026-03-15'));
    expect(result).toBe(0);
  });
});

describe('calcSummary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns zeros when no investments', () => {
    const result = calcSummary([], [bonds], false);
    expect(result.totalAmount).toBe(0);
    expect(result.averageInterestRate).toBe(0);
    expect(result.totalYearlyNet).toBe(0);
    expect(result.monthlyAverage).toBe(0);
    expect(result.currentMonthIncome).toBe(0);
  });

  it('includes activated non-future investments when includeFuture=false', () => {
    const inv = makeInvestment({ startDate: '2025-01-01', activated: true, amount: 10000, interestRate: 8 });
    const result = calcSummary([inv], [bonds], false);
    expect(result.totalAmount).toBe(10000);
    expect(result.totalYearlyNet).toBeCloseTo(800);
  });

  it('excludes inactive investments regardless of includeFuture', () => {
    const inv = makeInvestment({ startDate: '2025-01-01', activated: false, amount: 10000, interestRate: 8 });
    const result = calcSummary([inv], [bonds], false);
    expect(result.totalAmount).toBe(0);
  });

  it('inactive investments excluded even with includeFuture=true', () => {
    const inv = makeInvestment({ startDate: '2025-01-01', activated: false, amount: 10000, interestRate: 8 });
    const result = calcSummary([inv], [bonds], true);
    expect(result.totalAmount).toBe(0);
  });

  it('excludes future investments when includeFuture=false', () => {
    const futureInv = makeInvestment({ startDate: '2027-01-01', activated: true, amount: 10000, interestRate: 8 });
    const result = calcSummary([futureInv], [bonds], false);
    expect(result.totalAmount).toBe(0);
  });

  it('includes future investments when includeFuture=true', () => {
    const futureInv = makeInvestment({ startDate: '2027-01-01', activated: true, amount: 10000, interestRate: 8 });
    const result = calcSummary([futureInv], [bonds], true);
    expect(result.totalAmount).toBe(10000);
    expect(result.totalYearlyNet).toBeCloseTo(800);
  });

  it('mixed case: active+past, inactive, future; includeFuture=false', () => {
    const activeInv = makeInvestment({ id: 'a', startDate: '2025-01-01', activated: true, amount: 10000, interestRate: 8 });
    const inactiveInv = makeInvestment({ id: 'b', startDate: '2025-06-01', activated: false, amount: 5000, interestRate: 6 });
    const futureInv = makeInvestment({ id: 'c', startDate: '2027-01-01', activated: true, amount: 20000, interestRate: 10 });
    const result = calcSummary([activeInv, inactiveInv, futureInv], [bonds], false);
    expect(result.totalAmount).toBe(10000);
    expect(result.totalYearlyNet).toBeCloseTo(800);
  });

  it('mixed case: active+past, inactive, future; includeFuture=true', () => {
    const activeInv = makeInvestment({ id: 'a', startDate: '2025-01-01', activated: true, amount: 10000, interestRate: 8 });
    const inactiveInv = makeInvestment({ id: 'b', startDate: '2025-06-01', activated: false, amount: 5000, interestRate: 6 });
    const futureInv = makeInvestment({ id: 'c', startDate: '2027-01-01', activated: true, amount: 20000, interestRate: 10 });
    const result = calcSummary([activeInv, inactiveInv, futureInv], [bonds], true);
    // active (10000) + future (20000) = 30000
    expect(result.totalAmount).toBe(30000);
  });

  it('calculates averageInterestRate correctly', () => {
    // One investment: 10000 at 8%, no fee → yearlyNet=800, avgRate = 800/10000 * 100 = 8%
    const inv = makeInvestment({ startDate: '2025-01-01', activated: true, amount: 10000, interestRate: 8 });
    const result = calcSummary([inv], [bonds], false);
    expect(result.averageInterestRate).toBeCloseTo(8);
  });

  it('calculates monthlyAverage as totalYearlyNet / 12', () => {
    const inv = makeInvestment({ startDate: '2025-01-01', activated: true, amount: 12000, interestRate: 10 });
    const result = calcSummary([inv], [bonds], false);
    expect(result.monthlyAverage).toBeCloseTo(result.totalYearlyNet / 12);
  });
});
