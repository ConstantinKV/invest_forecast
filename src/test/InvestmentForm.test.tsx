import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestmentForm from '../components/InvestmentForm';
import type { Investment, InvestmentType } from '../types';
import { DEFAULT_INVESTMENT_TYPES } from '../types';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const investmentTypes: InvestmentType[] = DEFAULT_INVESTMENT_TYPES;

function renderForm(props: Partial<Parameters<typeof InvestmentForm>[0]> = {}) {
  const onSubmit = vi.fn();
  render(
    <InvestmentForm
      investmentTypes={investmentTypes}
      onSubmit={onSubmit}
      title="Add Investment"
      {...props}
    />
  );
  return { onSubmit };
}

describe('InvestmentForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders all form fields', () => {
    renderForm();
    // Use placeholder or type-based queries since labels don't use htmlFor
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.getByText('Interest Frequency')).toBeInTheDocument();
    expect(screen.getByText('Investment Type')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Currency')).toBeInTheDocument();
    expect(screen.getByText(/interest rate/i)).toBeInTheDocument();
    expect(screen.getByText('Activated')).toBeInTheDocument();
  });

  it('renders the form title', () => {
    renderForm({ title: 'Add Investment' });
    expect(screen.getByText('Add Investment')).toBeInTheDocument();
  });

  it('renders Save Investment button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /save investment/i })).toBeInTheDocument();
  });

  it('shows validation error for empty amount on submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /save investment/i }));
    expect(await screen.findByText(/amount must be a positive number/i)).toBeInTheDocument();
  });

  it('shows validation error for empty interest rate on submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /save investment/i }));
    expect(await screen.findByText(/interest rate must be between 0 and 100/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid rate > 100', async () => {
    // jsdom sanitizes input[type=number] values outside min/max range.
    // To test the rate > 100 validation, we need to set form state to 150
    // without going through the number input DOM.
    // Solution: use fireEvent.submit on the form, with the state seeded via
    // the form's change handlers before submission.
    const user = userEvent.setup();
    renderForm();
    const amountInput = screen.getByPlaceholderText(/e\.g\. 10000/i);
    await user.type(amountInput, '10000');
    // Set rate to 150 by calling the onChange handler directly via fireEvent
    // on the input treated as text input (change type before event):
    const rateInput = screen.getByPlaceholderText(/e\.g\. 8\.5/i);
    rateInput.setAttribute('type', 'text');
    fireEvent.change(rateInput, { target: { value: '150' } });
    // Submit the form directly - the React state now has interestRate='150'
    const form = rateInput.closest('form')!;
    fireEvent.submit(form);
    expect(await screen.findByText(/interest rate must be between 0 and 100/i)).toBeInTheDocument();
  });

  it('does NOT call onSubmit when form is invalid', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();
    await user.click(screen.getByRole('button', { name: /save investment/i }));
    await screen.findByText(/amount must be a positive number/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data on valid submit', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    const amountInput = screen.getByPlaceholderText(/e\.g\. 10000/i);
    const rateInput = screen.getByPlaceholderText(/e\.g\. 8\.5/i);

    await user.clear(amountInput);
    await user.type(amountInput, '10000');
    await user.clear(rateInput);
    await user.type(rateInput, '8.5');

    await user.click(screen.getByRole('button', { name: /save investment/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const callArg = onSubmit.mock.calls[0][0];
    expect(callArg.amount).toBe(10000);
    expect(callArg.interestRate).toBe(8.5);
    expect(callArg).not.toHaveProperty('id');
  });

  it('navigates after valid submit', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByPlaceholderText(/e\.g\. 10000/i), '10000');
    await user.type(screen.getByPlaceholderText(/e\.g\. 8\.5/i), '8');
    await user.click(screen.getByRole('button', { name: /save investment/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('edit mode pre-fills fields with initialValues', () => {
    const initialValues: Investment = {
      id: 'inv_test',
      startDate: '2025-06-15',
      period: 24,
      interestFrequency: 'biannual',
      investmentTypeId: 'bonds',
      amount: 25000,
      currency: 'EUR',
      interestRate: 7.5,
      activated: false,
    };
    renderForm({ initialValues, title: 'Edit Investment' });

    expect((screen.getByDisplayValue('2025-06-15') as HTMLInputElement).value).toBe('2025-06-15');
    expect((screen.getByDisplayValue('25000') as HTMLInputElement).value).toBe('25000');
    expect((screen.getByDisplayValue('7.5') as HTMLInputElement).value).toBe('7.5');
    // Check the period select value
    const periodSelect = screen.getByDisplayValue('24 months') as HTMLSelectElement;
    expect(periodSelect.value).toBe('24');
    // Check currency select
    const currencySelect = screen.getByDisplayValue('EUR') as HTMLSelectElement;
    expect(currencySelect.value).toBe('EUR');
    // Check frequency select
    const freqSelect = screen.getByDisplayValue('Biannual') as HTMLSelectElement;
    expect(freqSelect.value).toBe('biannual');
  });

  it('edit mode shows the correct title', () => {
    const initialValues: Investment = {
      id: 'inv_test',
      startDate: '2025-06-15',
      period: 12,
      interestFrequency: 'monthly',
      investmentTypeId: 'bonds',
      amount: 10000,
      currency: 'MDL',
      interestRate: 8,
      activated: true,
    };
    renderForm({ initialValues, title: 'Edit Investment' });
    expect(screen.getByText('Edit Investment')).toBeInTheDocument();
  });

  it('cancel button navigates to /', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
