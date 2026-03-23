import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Investment, InvestmentType } from '../types';
import { calcYearlyNet, isFutureInvestment } from '../utils/calculations';
import InvestmentRow from './InvestmentRow';
import InvestmentCard from './InvestmentCard';
import Summary from './Summary';

type SortField = 'date' | 'period' | 'amount' | 'rate' | 'yearlyNet';
type SortDir = 'asc' | 'desc';

interface InvestmentListProps {
  investments: Investment[];
  investmentTypes: InvestmentType[];
  onDelete: (id: string) => void;
}

const COLUMN_HINTS: Record<string, string> = {
  date: 'Month and year the investment starts',
  period: 'Total duration of the investment',
  frequency: 'How often interest payments are received',
  amount: 'Initial capital invested',
  rate: 'Annual interest rate before fees',
  yearlyNet: 'Annual interest income after tax/fee deduction',
  perPayment: 'Net amount received per payment based on frequency',
  actions: 'Edit or delete this investment',
};

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  const active = field === sortField;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`inline h-3.5 w-3.5 ml-1 transition-colors ${active ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {active && sortDir === 'asc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
      ) : active && sortDir === 'desc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      )}
    </svg>
  );
}

function SortableTh({
  label,
  hint,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  label: string;
  hint: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = field === sortField;
  return (
    <th
      className="px-4 py-3 text-left"
      title={hint}
    >
      <button
        onClick={() => onSort(field)}
        className={`inline-flex items-center text-xs font-semibold uppercase tracking-wider transition-colors ${
          active
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        {label}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </button>
    </th>
  );
}

function StaticTh({ label, hint }: { label: string; hint: string }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider" title={hint}>
      {label}
    </th>
  );
}

export default function InvestmentList({ investments, investmentTypes, onDelete }: InvestmentListProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [includeFuture, setIncludeFuture] = useState(false);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const getType = (typeId: string): InvestmentType | undefined =>
    investmentTypes.find((t) => t.id === typeId);

  const visible = includeFuture ? investments : investments.filter((inv) => !isFutureInvestment(inv));

  const sorted = [...visible].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'date':
        cmp = a.startDate.localeCompare(b.startDate);
        break;
      case 'period':
        cmp = a.period - b.period;
        break;
      case 'amount':
        cmp = a.amount - b.amount;
        break;
      case 'rate':
        cmp = a.interestRate - b.interestRate;
        break;
      case 'yearlyNet': {
        const typeA = getType(a.investmentTypeId);
        const typeB = getType(b.investmentTypeId);
        const netA = typeA ? calcYearlyNet(a, typeA) : 0;
        const netB = typeB ? calcYearlyNet(b, typeB) : 0;
        cmp = netA - netB;
        break;
      }
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleEdit = (id: string) => navigate(`/edit/${id}`);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      onDelete(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Investments</h1>
        <button
          onClick={() => navigate('/add')}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Investment
        </button>
      </div>

      {investments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No investments yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Add your first investment to start forecasting</p>
          <button
            onClick={() => navigate('/add')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Investment
          </button>
        </div>
      ) : (
        <>
          {/* Summary */}
          <Summary investments={investments} investmentTypes={investmentTypes} includeFuture={includeFuture} />

          {/* Future toggle */}
          <div
            className="flex items-center gap-3 cursor-pointer w-fit"
            onClick={() => setIncludeFuture((v) => !v)}
          >
            <span className="text-sm text-gray-700 dark:text-gray-300 select-none">Include future investments</span>
            <div
              role="switch"
              aria-checked={includeFuture}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                includeFuture ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  includeFuture ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <SortableTh label="Start Date" hint={COLUMN_HINTS.date} field="date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortableTh label="Period" hint={COLUMN_HINTS.period} field="period" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <StaticTh label="Frequency" hint={COLUMN_HINTS.frequency} />
                    <SortableTh label="Amount" hint={COLUMN_HINTS.amount} field="amount" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortableTh label="Rate" hint={COLUMN_HINTS.rate} field="rate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortableTh label="Yearly Net" hint={COLUMN_HINTS.yearlyNet} field="yearlyNet" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <StaticTh label="Per Payment" hint={COLUMN_HINTS.perPayment} />
                    <StaticTh label="Actions" hint={COLUMN_HINTS.actions} />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((investment) => (
                    <InvestmentRow
                      key={investment.id}
                      investment={investment}
                      investmentType={getType(investment.investmentTypeId)}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {sorted.map((investment) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                investmentType={getType(investment.investmentTypeId)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
