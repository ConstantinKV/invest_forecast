import { createContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AppSettings, InvestmentType } from '../types';
import { DEFAULT_SETTINGS } from '../types';

interface SettingsContextValue {
  settings: AppSettings;
  updateTheme: (theme: AppSettings['theme']) => void;
  addInvestmentType: (type: Omit<InvestmentType, 'id' | 'isDefault'>) => void;
  updateInvestmentType: (id: string, updates: Partial<Pick<InvestmentType, 'name' | 'fee'>>) => void;
  deleteInvestmentType: (id: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AppSettings>('invest_forecast_settings', DEFAULT_SETTINGS);

  const updateTheme = (theme: AppSettings['theme']) =>
    setSettings((prev) => ({ ...prev, theme }));

  const addInvestmentType = (type: Omit<InvestmentType, 'id' | 'isDefault'>) => {
    const newType: InvestmentType = { id: `type_${Date.now()}`, isDefault: false, ...type };
    setSettings((prev) => ({ ...prev, investmentTypes: [...prev.investmentTypes, newType] }));
  };

  const updateInvestmentType = (id: string, updates: Partial<Pick<InvestmentType, 'name' | 'fee'>>) =>
    setSettings((prev) => ({
      ...prev,
      investmentTypes: prev.investmentTypes.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));

  const deleteInvestmentType = (id: string) =>
    setSettings((prev) => ({
      ...prev,
      investmentTypes: prev.investmentTypes.filter((t) => t.id !== id || t.isDefault),
    }));

  return (
    <SettingsContext.Provider value={{ settings, updateTheme, addInvestmentType, updateInvestmentType, deleteInvestmentType }}>
      {children}
    </SettingsContext.Provider>
  );
}

