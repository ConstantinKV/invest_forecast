import { useEffect, useRef, useState } from 'react';
import type { Investment, InvestmentType } from '../types';
import { calcSummary } from '../utils/calculations';

interface SummaryProps {
  investments: Investment[];
  investmentTypes: InvestmentType[];
  includeFuture: boolean;
}

const HINTS: Record<string, string> = {
  totalAmount: 'Sum of all active investment principal amounts.',
  avgRate: 'Weighted average annual interest rate across active investments.',
  totalYearlyNet: 'Total annual income after fees and tax deductions.',
  monthly: 'Average monthly income — yearly net divided by 12.',
  currentMonth: 'Payments scheduled to land in the current calendar month.',
};

function RedCorner() {
  return (
    <span
      className="absolute top-0 right-0"
      style={{
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: '0 14px 14px 0',
        borderColor: 'transparent #ef4444 transparent transparent',
      }}
      aria-hidden
    />
  );
}

export default function Summary({ investments, investmentTypes, includeFuture }: SummaryProps) {
  const summary = calcSummary(investments, investmentTypes, includeFuture);
  const hasData = investments.length > 0;
  const currencies = [...new Set(investments.map((inv) => inv.currency))];
  const primaryCurrency = currencies.length === 1 ? currencies[0] : 'mixed';

  const [toast, setToast] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = (key: string) => {
    clearTimeout(timerRef.current);
    setToast(HINTS[key]);
    timerRef.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function formatNum(n: number): string {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Summary</h2>
        </div>

        {!hasData ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No investments to summarize.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              className="relative bg-green-50 dark:bg-green-900/20 rounded-xl p-4 cursor-pointer"
              onClick={() => showToast('totalAmount')}
            >
              <RedCorner />
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {formatNum(summary.totalAmount)}
                {primaryCurrency !== 'mixed' && <span className="text-sm font-normal ml-1">{primaryCurrency}</span>}
              </p>
            </div>

            <div
              className="relative bg-green-50 dark:bg-green-900/20 rounded-xl p-4 cursor-pointer"
              onClick={() => showToast('avgRate')}
            >
              <RedCorner />
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Avg Interest Rate</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {summary.averageInterestRate.toFixed(2)}%
              </p>
            </div>

            <div
              className="relative bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 cursor-pointer"
              onClick={() => showToast('totalYearlyNet')}
            >
              <RedCorner />
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Total Yearly Net</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatNum(summary.totalYearlyNet)}
                {primaryCurrency !== 'mixed' && <span className="text-sm font-normal ml-1">{primaryCurrency}</span>}
              </p>
            </div>

            <div
              className="relative bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 cursor-pointer"
              onClick={() => showToast('monthly')}
            >
              <RedCorner />
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Monthly Average</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatNum(summary.monthlyAverage)}
                {primaryCurrency !== 'mixed' && <span className="text-sm font-normal ml-1">{primaryCurrency}</span>}
              </p>
            </div>

            <div
              className="relative bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 sm:col-span-2 lg:col-span-2 cursor-pointer"
              onClick={() => showToast('currentMonth')}
            >
              <RedCorner />
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Current Month Income Forecast</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                {formatNum(summary.currentMonthIncome)}
                {primaryCurrency !== 'mixed' && <span className="text-sm font-normal ml-1">{primaryCurrency}</span>}
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Payments falling in current month</p>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-20 left-4 right-4 z-50 transition-all duration-300 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-xl px-4 py-3 shadow-lg text-center">
          {toast}
        </div>
      </div>
    </>
  );
}
