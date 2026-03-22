import type { Investment, InvestmentType } from '../types';
import { isFutureInvestment, calcYearlyNet, calcPerPayment } from '../utils/calculations';
import { formatMonthYear, formatCurrency, formatPeriod, formatFrequency, formatRate } from '../utils/formatters';

interface InvestmentCardProps {
  investment: Investment;
  investmentType: InvestmentType | undefined;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export default function InvestmentCard({ investment, investmentType, onEdit, onDelete }: InvestmentCardProps) {
  const isFuture = isFutureInvestment(investment);
  const yearlyNet = investmentType ? calcYearlyNet(investment, investmentType) : 0;
  const perPayment = investmentType ? calcPerPayment(investment, investmentType) : 0;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-4 ${
        isFuture
          ? 'opacity-50 border-blue-200 dark:border-blue-800 bg-green-50/20 dark:bg-green-900/10'
          : 'border-gray-200 dark:border-gray-700'
      } ${!investment.activated ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {formatMonthYear(investment.startDate)}
            </span>
            {isFuture && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Future
              </span>
            )}
            {!investment.activated && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {formatPeriod(investment.period)} &bull; {formatFrequency(investment.interestFrequency)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(investment.id)}
            className="p-2 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/30 transition-colors"
            title="Edit"
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => onDelete(investment.id)}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Amount</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(investment.amount, investment.currency)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Interest Rate</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatRate(investment.interestRate)}
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-0.5">Yearly Net</p>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(yearlyNet, investment.currency)}
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-0.5">Per Payment</p>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(perPayment, investment.currency)}
          </p>
        </div>
      </div>

      {investmentType && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {investmentType.name}
            {investmentType.fee > 0 && ` (fee: ${investmentType.fee}%)`}
          </span>
        </div>
      )}
    </div>
  );
}
