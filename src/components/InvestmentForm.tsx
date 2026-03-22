import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Investment, InvestmentType } from '../types';

interface InvestmentFormProps {
  initialValues?: Investment;
  investmentTypes: InvestmentType[];
  onSubmit: (data: Omit<Investment, 'id'>) => void;
  title: string;
}

type FormData = {
  startDate: string;
  period: string;
  interestFrequency: Investment['interestFrequency'];
  investmentTypeId: string;
  amount: string;
  currency: Investment['currency'];
  interestRate: string;
  activated: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
          checked ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";
const errorInputClass = "w-full px-3 py-2.5 rounded-lg border border-red-400 dark:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors";

export default function InvestmentForm({ initialValues, investmentTypes, onSubmit, title }: InvestmentFormProps) {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(() => {
    if (initialValues) {
      return {
        startDate: initialValues.startDate,
        period: String(initialValues.period),
        interestFrequency: initialValues.interestFrequency,
        investmentTypeId: initialValues.investmentTypeId,
        amount: String(initialValues.amount),
        currency: initialValues.currency,
        interestRate: String(initialValues.interestRate),
        activated: initialValues.activated,
      };
    }
    return {
      startDate: new Date().toISOString().split('T')[0],
      period: '12',
      interestFrequency: 'monthly',
      investmentTypeId: investmentTypes[0]?.id ?? '',
      amount: '',
      currency: 'MDL',
      interestRate: '',
      activated: true,
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const resolvedTypeId =
    form.investmentTypeId || (investmentTypes.length > 0 ? investmentTypes[0].id : '');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.startDate) newErrors.startDate = 'Start date is required';

    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    const rate = parseFloat(form.interestRate);
    if (!form.interestRate || isNaN(rate) || rate < 0 || rate > 100) {
      newErrors.interestRate = 'Interest rate must be between 0 and 100';
    }

    if (!resolvedTypeId) {
      newErrors.investmentTypeId = 'Investment type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: Omit<Investment, 'id'> = {
      startDate: form.startDate,
      period: parseInt(form.period) as Investment['period'],
      interestFrequency: form.interestFrequency,
      investmentTypeId: resolvedTypeId,
      amount: parseFloat(form.amount),
      currency: form.currency,
      interestRate: parseFloat(form.interestRate),
      activated: form.activated,
    };

    onSubmit(data);
    navigate('/');
  };

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Start Date" error={errors.startDate}>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className={errors.startDate ? errorInputClass : inputClass}
              />
            </FormField>

            <FormField label="Period">
              <select
                value={form.period}
                onChange={(e) => set('period', e.target.value)}
                className={inputClass}
              >
                {([6, 12, 18, 24, 25, 36, 60] as const).map((p) => (
                  <option key={p} value={p}>{p} months</option>
                ))}
              </select>
            </FormField>

            <FormField label="Interest Frequency">
              <select
                value={form.interestFrequency}
                onChange={(e) => set('interestFrequency', e.target.value as Investment['interestFrequency'])}
                className={inputClass}
              >
                <option value="monthly">Monthly</option>
                <option value="biannual">Biannual</option>
                <option value="annual">Annual</option>
              </select>
            </FormField>

            <FormField label="Investment Type" error={errors.investmentTypeId}>
              <select
                value={resolvedTypeId}
                onChange={(e) => set('investmentTypeId', e.target.value)}
                className={errors.investmentTypeId ? errorInputClass : inputClass}
              >
                {investmentTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.fee > 0 ? `(fee: ${t.fee}%)` : '(no fee)'}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Amount" error={errors.amount}>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 10000"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                className={errors.amount ? errorInputClass : inputClass}
              />
            </FormField>

            <FormField label="Currency">
              <select
                value={form.currency}
                onChange={(e) => set('currency', e.target.value as Investment['currency'])}
                className={inputClass}
              >
                <option value="MDL">MDL</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </FormField>

            <FormField label="Interest Rate (%)" error={errors.interestRate}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 8.5"
                value={form.interestRate}
                onChange={(e) => set('interestRate', e.target.value)}
                className={errors.interestRate ? errorInputClass : inputClass}
              />
            </FormField>

            <FormField label="Activated">
              <div className="py-2">
                <ToggleSwitch
                  checked={form.activated}
                  onChange={(v) => set('activated', v)}
                  label={form.activated ? 'Active' : 'Inactive'}
                />
              </div>
            </FormField>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save Investment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
