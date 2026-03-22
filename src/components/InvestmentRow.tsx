import type { Investment, InvestmentType } from '../types';
import { isFutureInvestment, calcYearlyNet, calcPerPayment } from '../utils/calculations';
import { formatMonthYear, formatCurrency, formatPeriod, formatFrequency, formatRate } from '../utils/formatters';

interface InvestmentRowProps {
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

export default function InvestmentRow({ investment, investmentType, onEdit, onDelete }: InvestmentRowProps) {
  const isFuture = isFutureInvestment(investment);
  const yearlyNet = investmentType ? calcYearlyNet(investment, investmentType) : 0;
  const perPayment = investmentType ? calcPerPayment(investment, investmentType) : 0;

  const rowClass = `border-b border-gray-100 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
    isFuture ? 'opacity-50 bg-green-50/30 dark:bg-green-900/10' : ''
  } ${!investment.activated ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`;

  return (
    <tr className={rowClass}>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {formatMonthYear(investment.startDate)}
          {isFuture && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Future
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {formatPeriod(investment.period)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {formatFrequency(investment.interestFrequency)}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
        {formatCurrency(investment.amount, investment.currency)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {formatRate(investment.interestRate)}
      </td>
      <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
        {formatCurrency(yearlyNet, investment.currency)}
      </td>
      <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
        {formatCurrency(perPayment, investment.currency)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(investment.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/30 transition-colors"
            title="Edit"
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => onDelete(investment.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}
