import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Summary from '../components/Summary';
import type { Investment, InvestmentType } from '../types';
import { DEFAULT_INVESTMENT_TYPES } from '../types';

const TODAY = new Date('2026-03-22T00:00:00.000Z');

const bonds: InvestmentType = { id: 'bonds', name: 'Bonds', fee: 0, isDefault: true };

function makeInvestment(overrides: Partial<Investment> = {}): Investment {
  return {
    id: 'inv_1',
    startDate: '2025-01-01',
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

describe('Summary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders "No investments" message when empty', () => {
    render(<Summary investments={[]} investmentTypes={DEFAULT_INVESTMENT_TYPES} includeFuture={false} />);
    expect(screen.getByText(/no investments to summarize/i)).toBeInTheDocument();
  });

  it('shows correct total amount for a single investment', () => {
    const inv = makeInvestment({ amount: 10000 });
    render(<Summary investments={[inv]} investmentTypes={[bonds]} includeFuture={false} />);
    expect(screen.getByText(/10,000\.00/)).toBeInTheDocument();
  });

  it('shows correct total amount for multiple investments', () => {
    const inv1 = makeInvestment({ id: 'a', amount: 10000 });
    const inv2 = makeInvestment({ id: 'b', amount: 5000 });
    render(<Summary investments={[inv1, inv2]} investmentTypes={[bonds]} includeFuture={false} />);
    expect(screen.getByText(/15,000\.00/)).toBeInTheDocument();
  });

  it('shows correct yearly net income', () => {
    // amount=10000, rate=8%, fee=0 → yearlyNet=800
    const inv = makeInvestment({ amount: 10000, interestRate: 8 });
    render(<Summary investments={[inv]} investmentTypes={[bonds]} includeFuture={false} />);
    expect(screen.getByText(/800\.00/)).toBeInTheDocument();
  });

  it('shows correct average rate', () => {
    // amount=10000, rate=8%, fee=0 → yearlyNet=800 → avgRate = 800/10000 * 100 = 8%
    const inv = makeInvestment({ amount: 10000, interestRate: 8 });
    render(<Summary investments={[inv]} investmentTypes={[bonds]} includeFuture={false} />);
    expect(screen.getByText(/8\.00%/)).toBeInTheDocument();
  });

  it('future investments excluded by default (includeFuture=false)', () => {
    const futureInv = makeInvestment({ startDate: '2027-01-01', amount: 50000 });
    render(<Summary investments={[futureInv]} investmentTypes={[bonds]} includeFuture={false} />);
    // With future excluded, totalAmount=0 (not 50000) — 50000 should NOT appear
    expect(screen.queryByText(/50,000\.00/)).not.toBeInTheDocument();
    // The stats area shows (totalAmount=0, not future inv amount)
    expect(screen.getByText('Total Amount')).toBeInTheDocument();
  });

  it('future investments included when includeFuture=true', () => {
    const futureInv = makeInvestment({ startDate: '2027-01-01', amount: 10000, interestRate: 8 });
    render(<Summary investments={[futureInv]} investmentTypes={[bonds]} includeFuture={true} />);
    expect(screen.getByText(/10,000\.00/)).toBeInTheDocument();
  });

  it('inactive investments always excluded', () => {
    const inactiveInv = makeInvestment({ activated: false, amount: 50000 });
    render(<Summary investments={[inactiveInv]} investmentTypes={[bonds]} includeFuture={false} />);
    // totalAmount should be 0 since inactive is excluded
    expect(screen.queryByText(/50,000\.00/)).not.toBeInTheDocument();
  });

  it('inactive investments excluded even with includeFuture=true', () => {
    const inactiveInv = makeInvestment({ activated: false, amount: 50000 });
    render(<Summary investments={[inactiveInv]} investmentTypes={[bonds]} includeFuture={true} />);
    expect(screen.queryByText(/50,000\.00/)).not.toBeInTheDocument();
  });

  it('shows Summary heading', () => {
    render(<Summary investments={[]} investmentTypes={[bonds]} includeFuture={false} />);
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });
});
