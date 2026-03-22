import type { Investment, InvestmentType } from '../types';
import { isAfter, parseISO, addMonths, getMonth, getYear } from 'date-fns';

export function isFutureInvestment(investment: Investment): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isAfter(parseISO(investment.startDate), today);
}

export function calcYearlyNet(investment: Investment, investmentType: InvestmentType): number {
  const { amount, interestRate } = investment;
  const fee = investmentType.fee;
  return amount * (interestRate / 100) * (1 - fee / 100);
}

export function calcPerPayment(investment: Investment, investmentType: InvestmentType): number {
  const yearlyNet = calcYearlyNet(investment, investmentType);
  switch (investment.interestFrequency) {
    case 'monthly':
      return yearlyNet / 12;
    case 'biannual':
      return yearlyNet / 2;
    case 'annual':
      return yearlyNet;
  }
}

export function getPaymentMonths(investment: Investment): Date[] {
  const start = parseISO(investment.startDate);
  const payments: Date[] = [];

  if (investment.interestFrequency === 'monthly') {
    for (let i = 1; i <= investment.period; i++) {
      payments.push(addMonths(start, i));
    }
  } else if (investment.interestFrequency === 'biannual') {
    for (let i = 6; i <= investment.period; i += 6) {
      payments.push(addMonths(start, i));
    }
  } else if (investment.interestFrequency === 'annual') {
    for (let i = 12; i <= investment.period; i += 12) {
      payments.push(addMonths(start, i));
    }
  }

  return payments;
}

export function calcCurrentMonthIncome(
  investments: Investment[],
  investmentTypes: InvestmentType[],
  today: Date = new Date()
): number {
  const currentMonth = getMonth(today);
  const currentYear = getYear(today);

  return investments.reduce((total, investment) => {
    const type = investmentTypes.find((t) => t.id === investment.investmentTypeId);
    if (!type) return total;

    const paymentMonths = getPaymentMonths(investment);
    const hasPaymentThisMonth = paymentMonths.some(
      (date) => getMonth(date) === currentMonth && getYear(date) === currentYear
    );

    if (hasPaymentThisMonth) {
      return total + calcPerPayment(investment, type);
    }
    return total;
  }, 0);
}

export interface SummaryData {
  totalAmount: number;
  averageInterestRate: number;
  totalYearlyNet: number;
  monthlyAverage: number;
  currentMonthIncome: number;
}

export function calcSummary(
  investments: Investment[],
  investmentTypes: InvestmentType[],
  includeFuture: boolean
): SummaryData {
  const filtered = investments.filter((inv) => {
    const isFuture = isFutureInvestment(inv);
    if (isFuture) return includeFuture; // future: include only when toggle is on
    return inv.activated; // non-future: include only if activated
  });

  const totalAmount = filtered.reduce((sum, inv) => sum + inv.amount, 0);
  const totalYearlyNet = filtered.reduce((sum, inv) => {
    const type = investmentTypes.find((t) => t.id === inv.investmentTypeId);
    if (!type) return sum;
    return sum + calcYearlyNet(inv, type);
  }, 0);

  const averageInterestRate = totalAmount > 0 ? (totalYearlyNet / totalAmount) * 100 : 0;
  const monthlyAverage = totalYearlyNet / 12;

  const currentMonthIncome = calcCurrentMonthIncome(filtered, investmentTypes);

  return {
    totalAmount,
    averageInterestRate,
    totalYearlyNet,
    monthlyAverage,
    currentMonthIncome,
  };
}
