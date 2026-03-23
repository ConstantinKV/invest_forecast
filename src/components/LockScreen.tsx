import { useRef, useState } from 'react';
import PinField from 'react-pin-field';

interface LockScreenProps {
  onUnlock: (pin: string) => Promise<boolean>;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const pinRef = useRef<HTMLInputElement[]>([]);

  const handleComplete = async (pin: string) => {
    const ok = await onUnlock(pin);
    if (!ok) {
      setError(true);
      setShaking(true);
      pinRef.current.forEach((input) => { input.value = ''; });
      pinRef.current[0]?.focus();
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 z-50 gap-8">
      {/* Lock icon */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Enter PIN</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Enter your 4-digit PIN to unlock</p>
      </div>

      {/* PIN fields */}
      <div className={shaking ? 'shake' : ''}>
        <PinField
          ref={pinRef}
          length={4}
          format={(char) => (/^[0-9]$/.test(char) ? char : '')}
          type="password"
          inputMode="numeric"
          autoFocus
          onComplete={handleComplete}
          onChange={() => setError(false)}
          className="w-14 h-16 text-2xl font-bold text-center mx-2 rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors"
        />
      </div>

      {/* Error message */}
      <p className={`text-sm font-medium transition-opacity ${error ? 'text-red-500 dark:text-red-400 opacity-100' : 'opacity-0'}`}>
        Incorrect PIN. Try again.
      </p>
    </div>
  );
}
