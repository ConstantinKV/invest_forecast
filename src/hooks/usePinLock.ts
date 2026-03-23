import { useState } from 'react';

const PIN_KEY = 'invest_forecast_pin';

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function usePinLock() {
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem(PIN_KEY));
  const [hasPin, setHasPin] = useState(() => !!localStorage.getItem(PIN_KEY));

  const setupPin = async (pin: string) => {
    const hash = await hashPin(pin);
    localStorage.setItem(PIN_KEY, hash);
    setHasPin(true);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    const stored = localStorage.getItem(PIN_KEY);
    if (!stored) return true;
    const hash = await hashPin(pin);
    return hash === stored;
  };

  const removePin = () => {
    localStorage.removeItem(PIN_KEY);
    setHasPin(false);
  };

  const unlock = () => setIsLocked(false);

  return { isLocked, hasPin, setupPin, verifyPin, removePin, unlock };
}
