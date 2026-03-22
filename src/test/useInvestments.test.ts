import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInvestments } from '../hooks/useInvestments';
import type { Investment } from '../types';

const STORAGE_KEY = 'invest_forecast_investments';

function makeInvestmentData(): Omit<Investment, 'id'> {
  return {
    startDate: '2026-01-01',
    period: 12,
    interestFrequency: 'monthly',
    investmentTypeId: 'bonds',
    amount: 10000,
    currency: 'MDL',
    interestRate: 8,
    activated: true,
  };
}

describe('useInvestments', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty array when localStorage is empty', () => {
    const { result } = renderHook(() => useInvestments());
    expect(result.current.investments).toEqual([]);
  });

  it('addInvestment adds an investment with generated id', () => {
    const { result } = renderHook(() => useInvestments());
    let added: Investment;
    act(() => {
      added = result.current.addInvestment(makeInvestmentData());
    });
    expect(result.current.investments).toHaveLength(1);
    expect(result.current.investments[0].id).toBeTruthy();
    expect(result.current.investments[0].id).toMatch(/^inv_/);
    expect(result.current.investments[0].startDate).toBe('2026-01-01');
    expect(result.current.investments[0].amount).toBe(10000);
  });

  it('addInvestment returns the new investment', () => {
    const { result } = renderHook(() => useInvestments());
    let added: Investment;
    act(() => {
      added = result.current.addInvestment(makeInvestmentData());
    });
    expect(added!).toBeDefined();
    expect(added!.id).toBeTruthy();
  });

  it('addInvestment adds multiple investments with unique ids', () => {
    const { result } = renderHook(() => useInvestments());
    act(() => {
      result.current.addInvestment(makeInvestmentData());
    });
    act(() => {
      result.current.addInvestment({ ...makeInvestmentData(), amount: 20000 });
    });
    expect(result.current.investments).toHaveLength(2);
    const ids = result.current.investments.map((i) => i.id);
    expect(new Set(ids).size).toBe(2); // all unique
  });

  it('updateInvestment updates the correct investment', () => {
    const { result } = renderHook(() => useInvestments());
    let inv: Investment;
    act(() => {
      inv = result.current.addInvestment(makeInvestmentData());
    });
    act(() => {
      result.current.updateInvestment(inv!.id, { amount: 99999 });
    });
    const updated = result.current.investments.find((i) => i.id === inv!.id);
    expect(updated?.amount).toBe(99999);
  });

  it('updateInvestment does not affect other investments', () => {
    const { result } = renderHook(() => useInvestments());
    let inv1: Investment, inv2: Investment;
    act(() => {
      inv1 = result.current.addInvestment(makeInvestmentData());
    });
    act(() => {
      inv2 = result.current.addInvestment({ ...makeInvestmentData(), amount: 20000 });
    });
    act(() => {
      result.current.updateInvestment(inv1!.id, { amount: 5000 });
    });
    const unchanged = result.current.investments.find((i) => i.id === inv2!.id);
    expect(unchanged?.amount).toBe(20000);
  });

  it('deleteInvestment removes the correct investment', () => {
    const { result } = renderHook(() => useInvestments());
    let inv: Investment;
    act(() => {
      inv = result.current.addInvestment(makeInvestmentData());
    });
    act(() => {
      result.current.deleteInvestment(inv!.id);
    });
    expect(result.current.investments).toHaveLength(0);
  });

  it('deleteInvestment does not remove other investments', () => {
    const { result } = renderHook(() => useInvestments());
    let inv1: Investment, inv2: Investment;
    act(() => {
      inv1 = result.current.addInvestment(makeInvestmentData());
    });
    act(() => {
      inv2 = result.current.addInvestment({ ...makeInvestmentData(), amount: 20000 });
    });
    act(() => {
      result.current.deleteInvestment(inv1!.id);
    });
    expect(result.current.investments).toHaveLength(1);
    expect(result.current.investments[0].id).toBe(inv2!.id);
  });

  it('getInvestment returns the correct investment by id', () => {
    const { result } = renderHook(() => useInvestments());
    let inv: Investment;
    act(() => {
      inv = result.current.addInvestment(makeInvestmentData());
    });
    const found = result.current.getInvestment(inv!.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(inv!.id);
  });

  it('getInvestment returns undefined for non-existent id', () => {
    const { result } = renderHook(() => useInvestments());
    const found = result.current.getInvestment('non_existent_id');
    expect(found).toBeUndefined();
  });

  it('persists investments to localStorage', () => {
    const { result } = renderHook(() => useInvestments());
    act(() => {
      result.current.addInvestment(makeInvestmentData());
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].amount).toBe(10000);
  });
});
