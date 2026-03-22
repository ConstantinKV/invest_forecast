import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Investment } from '../types';

const STORAGE_KEY = 'invest_forecast_investments';

export function useInvestments() {
  const [investments, setInvestments] = useLocalStorage<Investment[]>(STORAGE_KEY, []);

  const addInvestment = useCallback((investment: Omit<Investment, 'id'>) => {
    const newInvestment: Investment = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...investment,
    };
    setInvestments((prev) => [...prev, newInvestment]);
    return newInvestment;
  }, [setInvestments]);

  const updateInvestment = useCallback((id: string, updates: Partial<Omit<Investment, 'id'>>) => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
  }, [setInvestments]);

  const deleteInvestment = useCallback((id: string) => {
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  }, [setInvestments]);

  const getInvestment = useCallback((id: string): Investment | undefined => {
    return investments.find((inv) => inv.id === id);
  }, [investments]);

  return {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    getInvestment,
  };
}
