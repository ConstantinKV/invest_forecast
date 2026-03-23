import { useRef, useState } from 'react';
import PinField from 'react-pin-field';
import type { InvestmentType, AppSettings } from '../types';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateTheme: (theme: AppSettings['theme']) => void;
  onAddType: (type: Omit<InvestmentType, 'id' | 'isDefault'>) => void;
  onUpdateType: (id: string, updates: Partial<Pick<InvestmentType, 'name' | 'fee'>>) => void;
  onDeleteType: (id: string) => void;
  hasPin: boolean;
  onSetPin: (pin: string) => Promise<void>;
  onVerifyPin: (pin: string) => Promise<boolean>;
  onRemovePin: () => void;
}

type PinMode =
  | 'idle'
  | 'set-new'
  | 'set-confirm'
  | 'change-verify'
  | 'change-new'
  | 'change-confirm'
  | 'remove-verify';

function PinSection({
  hasPin,
  onSetPin,
  onVerifyPin,
  onRemovePin,
}: Pick<SettingsPageProps, 'hasPin' | 'onSetPin' | 'onVerifyPin' | 'onRemovePin'>) {
  const [mode, setMode] = useState<PinMode>('idle');
  const [pendingPin, setPendingPin] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const pinRef = useRef<HTMLInputElement[]>([]);

  const resetPinField = (msg?: string) => {
    if (msg) {
      setError(msg);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
    pinRef.current.forEach((input) => { input.value = ''; });
    pinRef.current[0]?.focus();
  };

  const cancel = () => { setMode('idle'); setError(''); setPendingPin(''); };

  const handleComplete = async (pin: string) => {
    setError('');
    switch (mode) {
      case 'set-new':
        setPendingPin(pin);
        setMode('set-confirm');
        break;

      case 'set-confirm':
        if (pin !== pendingPin) { resetPinField('PINs do not match. Try again.'); return; }
        await onSetPin(pin);
        cancel();
        break;

      case 'change-verify': {
        const ok = await onVerifyPin(pin);
        if (!ok) { resetPinField('Incorrect PIN. Try again.'); return; }
        setPendingPin('');
        setMode('change-new');
        break;
      }

      case 'change-new':
        setPendingPin(pin);
        setMode('change-confirm');
        break;

      case 'change-confirm':
        if (pin !== pendingPin) { resetPinField('PINs do not match. Try again.'); return; }
        await onSetPin(pin);
        cancel();
        break;

      case 'remove-verify': {
        const ok = await onVerifyPin(pin);
        if (!ok) { resetPinField('Incorrect PIN. Try again.'); return; }
        onRemovePin();
        cancel();
        break;
      }
    }
  };

  const modeLabel: Record<PinMode, string> = {
    'idle': '',
    'set-new': 'Enter new PIN',
    'set-confirm': 'Confirm new PIN',
    'change-verify': 'Enter current PIN',
    'change-new': 'Enter new PIN',
    'change-confirm': 'Confirm new PIN',
    'remove-verify': 'Enter PIN to confirm removal',
  };

  const pinInputClass =
    'w-12 h-14 text-xl font-bold text-center mx-1.5 rounded-xl border-2 bg-white dark:bg-gray-700 ' +
    'text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ' +
    'focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">PIN Lock</h2>

      {mode === 'idle' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-block w-2 h-2 rounded-full ${hasPin ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {hasPin ? 'PIN lock is enabled' : 'PIN lock is disabled'}
            </span>
          </div>
          {!hasPin ? (
            <button
              onClick={() => setMode('set-new')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Enable PIN Lock
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setMode('change-verify')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Change PIN
              </button>
              <button
                onClick={() => setMode('remove-verify')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                Remove PIN
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{modeLabel[mode]}</p>
          <div className={shaking ? 'shake' : ''}>
            <PinField
              ref={pinRef}
              key={mode}
              length={4}
              format={(char) => (/^[0-9]$/.test(char) ? char : '')}
              type="password"
              inputMode="numeric"
              autoFocus
              onComplete={handleComplete}
              onChange={() => setError('')}
              className={pinInputClass}
            />
          </div>
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          <button
            onClick={cancel}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

interface EditableTypeRowProps {
  type: InvestmentType;
  onUpdate: (id: string, updates: Partial<Pick<InvestmentType, 'name' | 'fee'>>) => void;
  onDelete: (id: string) => void;
}

function EditableTypeRow({ type, onUpdate, onDelete }: EditableTypeRowProps) {
  const [editingFee, setEditingFee] = useState(false);
  const [feeValue, setFeeValue] = useState(String(type.fee));

  const saveFee = () => {
    const fee = parseFloat(feeValue);
    if (!isNaN(fee) && fee >= 0 && fee <= 100) {
      onUpdate(type.id, { fee });
      setEditingFee(false);
    }
  };

  const cancelEdit = () => {
    setFeeValue(String(type.fee));
    setEditingFee(false);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{type.name}</span>
          {type.isDefault && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              default
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Fee:</span>
          {editingFee ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={feeValue}
                onChange={(e) => setFeeValue(e.target.value)}
                className="w-20 px-2 py-1 text-xs rounded border border-green-400 dark:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveFee();
                  if (e.key === 'Escape') cancelEdit();
                }}
              />
              <span className="text-xs text-gray-500">%</span>
              <button
                onClick={saveFee}
                className="p-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 rounded transition-colors"
              >
                <CheckIcon />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <XIcon />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingFee(true)}
              className="text-xs text-green-600 dark:text-green-400 hover:underline font-medium"
            >
              {type.fee}%
            </button>
          )}
        </div>
      </div>
      {!type.isDefault && (
        <button
          onClick={() => onDelete(type.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors ml-3"
          title="Delete"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

export default function SettingsPage({ settings, onUpdateTheme, onAddType, onUpdateType, onDeleteType, hasPin, onSetPin, onVerifyPin, onRemovePin }: SettingsPageProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFee, setNewFee] = useState('');
  const [addError, setAddError] = useState('');

  const handleAdd = () => {
    const fee = parseFloat(newFee);
    if (!newName.trim()) {
      setAddError('Name is required');
      return;
    }
    if (isNaN(fee) || fee < 0 || fee > 100) {
      setAddError('Fee must be between 0 and 100');
      return;
    }
    onAddType({ name: newName.trim(), fee });
    setNewName('');
    setNewFee('');
    setAddError('');
    setShowAddForm(false);
  };

  const themeOptions: Array<{ value: AppSettings['theme']; label: string; icon: string }> = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

      {/* Investment Types */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Investment Types</h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Type
            </button>
          )}
        </div>

        <div>
          {settings.investmentTypes.map((type) => (
            <EditableTypeRow
              key={type.id}
              type={type}
              onUpdate={onUpdateType}
              onDelete={onDeleteType}
            />
          ))}
        </div>

        {showAddForm && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">New Investment Type</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g. ETF Fund"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setAddError(''); }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fee (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 5"
                  value={newFee}
                  onChange={(e) => { setNewFee(e.target.value); setAddError(''); }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                />
              </div>
            </div>
            {addError && <p className="text-xs text-red-600 dark:text-red-400 mb-3">{addError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddForm(false); setNewName(''); setNewFee(''); setAddError(''); }}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PIN Lock */}
      <PinSection hasPin={hasPin} onSetPin={onSetPin} onVerifyPin={onVerifyPin} onRemovePin={onRemovePin} />

      {/* Theme */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Theme</h2>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => onUpdateTheme(value)}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                settings.theme === value
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">About</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}invest_forecast.png`} alt="Invest Forecast" className="w-10 h-10 rounded-xl" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Invest Forecast</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">v0.2.0</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Personal investment forecasting tool. Tracks investments and calculates expected interest income. All data is stored locally on your device.</p>
          <a
            href="https://github.com/ConstantinKV/invest_forecast"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub Repository
          </a>
        </div>
      </div>
    </div>
  );
}
