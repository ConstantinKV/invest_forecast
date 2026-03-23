import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InvestmentList from '../components/InvestmentList';
import type { Investment, InvestmentType } from '../types';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const bonds: InvestmentType = { id: 'bonds', name: 'Bonds', fee: 0, isDefault: true };

function makeInvestment(overrides: Partial<Investment> = {}): Investment {
  return {
    id: 'inv_1',
    startDate: '2025-01-01',
    period: 12,
    interestFrequency: 'monthly',
    investmentTypeId: 'bonds',
    amount: 10000,
    currency: 'MDL',
    interestRate: 8,
    activated: true,
    ...overrides,
  };
}

describe('InvestmentList', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-22T00:00:00.000Z'));
    mockNavigate.mockClear();
    // Override window.confirm for jsdom (which has no dialog support)
    window.confirm = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows empty state when no investments', () => {
    render(<InvestmentList investments={[]} investmentTypes={[bonds]} onDelete={vi.fn()} />);
    expect(screen.getByText(/no investments yet/i)).toBeInTheDocument();
  });

  it('renders investment rows when investments are provided', () => {
    const inv = makeInvestment({ startDate: '2025-01-01' });
    render(<InvestmentList investments={[inv]} investmentTypes={[bonds]} onDelete={vi.fn()} />);
    // The investment date should be visible (appears in table and card)
    expect(screen.getAllByText(/jan 2025/i).length).toBeGreaterThan(0);
  });

  it('renders multiple investment rows', () => {
    const inv1 = makeInvestment({ id: 'a', startDate: '2025-01-01' });
    const inv2 = makeInvestment({ id: 'b', startDate: '2025-06-01' });
    render(<InvestmentList investments={[inv1, inv2]} investmentTypes={[bonds]} onDelete={vi.fn()} />);
    expect(screen.getAllByText(/jan 2025/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/jun 2025/i).length).toBeGreaterThan(0);
  });

  it('future rows are hidden by default', () => {
    const futureInv = makeInvestment({ id: 'future', startDate: '2027-01-01' });
    const pastInv = makeInvestment({ id: 'past', startDate: '2025-01-01' });
    render(<InvestmentList investments={[futureInv, pastInv]} investmentTypes={[bonds]} onDelete={vi.fn()} />);
    // Future "Jan 2027" should not appear since includeFuture defaults to false
    expect(screen.queryAllByText(/jan 2027/i)).toHaveLength(0);
    // Past investment should be visible
    expect(screen.getAllByText(/jan 2025/i).length).toBeGreaterThan(0);
  });

  it('future rows shown when toggle is enabled', () => {
    const futureInv = makeInvestment({ id: 'future', startDate: '2027-01-01' });
    const pastInv = makeInvestment({ id: 'past', startDate: '2025-01-01' });
    render(<InvestmentList investments={[futureInv, pastInv]} investmentTypes={[bonds]} onDelete={vi.fn()} />);

    // The toggle div contains the label text
    const toggleContainer = screen.getByText(/include future investments/i).closest('div');
    fireEvent.click(toggleContainer!);

    expect(screen.getAllByText(/jan 2027/i).length).toBeGreaterThan(0);
  });

  it('calls onDelete after confirmation when delete button is clicked', () => {
    const onDelete = vi.fn();
    const inv = makeInvestment({ id: 'inv_to_delete', startDate: '2025-01-01' });
    render(<InvestmentList investments={[inv]} investmentTypes={[bonds]} onDelete={onDelete} />);

    // Use exact title 'Delete' to avoid matching the th title "Edit or delete this investment"
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('inv_to_delete');
  });

  it('does NOT call onDelete when user cancels confirmation', () => {
    window.confirm = vi.fn().mockReturnValue(false);
    const onDelete = vi.fn();
    const inv = makeInvestment({ id: 'inv_keep', startDate: '2025-01-01' });
    render(<InvestmentList investments={[inv]} investmentTypes={[bonds]} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('sort by date descending works (default)', () => {
    const inv1 = makeInvestment({ id: 'a', startDate: '2025-06-01' });
    const inv2 = makeInvestment({ id: 'b', startDate: '2025-01-01' });
    render(<InvestmentList investments={[inv1, inv2]} investmentTypes={[bonds]} onDelete={vi.fn()} />);

    // Default sort is 'date' descending, so Jun should come before Jan
    const cells = screen.getAllByText(/2025/i);
    const texts = cells.map((el) => el.textContent);
    const janIdx = texts.findIndex((t) => t?.includes('Jan'));
    const junIdx = texts.findIndex((t) => t?.includes('Jun'));
    expect(junIdx).toBeLessThan(janIdx);
  });

  it('sort by date ascending works after clicking date header', () => {
    const inv1 = makeInvestment({ id: 'a', startDate: '2025-01-01' });
    const inv2 = makeInvestment({ id: 'b', startDate: '2025-06-01' });
    render(<InvestmentList investments={[inv1, inv2]} investmentTypes={[bonds]} onDelete={vi.fn()} />);

    // Click Start Date to toggle to ascending (default is descending)
    const dateHeader = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(dateHeader); // now ascending

    const cells = screen.getAllByText(/2025/i);
    const texts = cells.map((el) => el.textContent);
    const janIdx = texts.findIndex((t) => t?.includes('Jan'));
    const junIdx = texts.findIndex((t) => t?.includes('Jun'));
    // In ascending, Jan comes before Jun
    expect(janIdx).toBeLessThan(junIdx);
  });

  it('sort by amount works', () => {
    const inv1 = makeInvestment({ id: 'a', startDate: '2025-01-01', amount: 50000 });
    const inv2 = makeInvestment({ id: 'b', startDate: '2025-06-01', amount: 10000 });
    render(<InvestmentList investments={[inv1, inv2]} investmentTypes={[bonds]} onDelete={vi.fn()} />);

    const amountHeader = screen.getByRole('button', { name: /amount/i });
    fireEvent.click(amountHeader);

    // After clicking Amount, sorts ascending: 10000 should appear before 50000
    const amountCells = screen.getAllByText(/,000\.00/i);
    const texts = amountCells.map((el) => el.textContent);
    const idx10k = texts.findIndex((t) => t?.includes('10,000'));
    const idx50k = texts.findIndex((t) => t?.includes('50,000'));
    expect(idx10k).toBeLessThan(idx50k);
  });

  it('shows "Include future investments" toggle when there are investments', () => {
    const inv = makeInvestment({ startDate: '2025-01-01' });
    render(<InvestmentList investments={[inv]} investmentTypes={[bonds]} onDelete={vi.fn()} />);
    expect(screen.getByText(/include future investments/i)).toBeInTheDocument();
  });

  it('navigates to edit page when edit button clicked', () => {
    const inv = makeInvestment({ id: 'inv_edit', startDate: '2025-01-01' });
    render(<InvestmentList investments={[inv]} investmentTypes={[bonds]} onDelete={vi.fn()} />);

    // Use exact title 'Edit' to avoid matching the th with title "Edit or delete this investment"
    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/edit/inv_edit');
  });
});
