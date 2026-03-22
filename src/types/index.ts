export interface InvestmentType {
  id: string;
  name: string;
  fee: number; // percentage, e.g. 12 means 12%
  isDefault: boolean;
}

export interface Investment {
  id: string;
  startDate: string; // ISO date
  period: 6 | 12 | 18 | 24 | 25 | 36 | 60; // months
  interestFrequency: 'monthly' | 'biannual' | 'annual';
  investmentTypeId: string;
  amount: number;
  currency: 'MDL' | 'EUR' | 'USD';
  interestRate: number; // annual %, e.g. 8.5
  activated: boolean;
}

export interface AppSettings {
  investmentTypes: InvestmentType[];
  theme: 'light' | 'dark' | 'system';
}

export const DEFAULT_INVESTMENT_TYPES: InvestmentType[] = [
  { id: 'bonds', name: 'Bonds', fee: 0, isDefault: true },
  { id: 'bank_deposit', name: 'Bank Deposit', fee: 6, isDefault: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  investmentTypes: DEFAULT_INVESTMENT_TYPES,
  theme: 'system',
};
