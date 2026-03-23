import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import InvestmentList from './components/InvestmentList';
import InvestmentForm from './components/InvestmentForm';
import SettingsPage from './components/SettingsPage';
import LockScreen from './components/LockScreen';
import { useInvestments } from './hooks/useInvestments';
import { SettingsProvider } from './contexts/SettingsContext';
import { useSettings } from './hooks/useSettings';
import { usePinLock } from './hooks/usePinLock';
import type { Investment } from './types';

function AddPage() {
  const { addInvestment } = useInvestments();
  const { settings } = useSettings();

  return (
    <InvestmentForm
      title="Add Investment"
      investmentTypes={settings.investmentTypes}
      onSubmit={(data) => addInvestment(data)}
    />
  );
}

function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvestment, updateInvestment } = useInvestments();
  const { settings } = useSettings();

  const investment = id ? getInvestment(id) : undefined;

  useEffect(() => {
    if (id && !investment) {
      navigate('/');
    }
  }, [id, investment, navigate]);

  if (!investment) return null;

  const handleSubmit = (data: Omit<Investment, 'id'>) => {
    updateInvestment(investment.id, data);
  };

  return (
    <InvestmentForm
      title="Edit Investment"
      initialValues={investment}
      investmentTypes={settings.investmentTypes}
      onSubmit={handleSubmit}
    />
  );
}

function ListPage() {
  const { investments, deleteInvestment } = useInvestments();
  const { settings } = useSettings();

  return (
    <InvestmentList
      investments={investments}
      investmentTypes={settings.investmentTypes}
      onDelete={deleteInvestment}
    />
  );
}

function Settings() {
  const { settings, updateTheme, addInvestmentType, updateInvestmentType, deleteInvestmentType } = useSettings();
  const { hasPin, setupPin, verifyPin, removePin } = usePinLock();

  return (
    <SettingsPage
      settings={settings}
      onUpdateTheme={updateTheme}
      onAddType={addInvestmentType}
      onUpdateType={updateInvestmentType}
      onDeleteType={deleteInvestmentType}
      hasPin={hasPin}
      onSetPin={setupPin}
      onVerifyPin={verifyPin}
      onRemovePin={removePin}
    />
  );
}

const BG_LIGHT = '#ffffff';
const BG_DARK = '#111827'; // Tailwind gray-900

function applyStatusBarColor(isDark: boolean) {
  const color = isDark ? BG_DARK : BG_LIGHT;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  // iOS standalone: swap status bar style meta tag dynamically
  const iosMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  iosMeta?.setAttribute('content', isDark ? 'black' : 'default');
}

function ThemeManager() {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      applyStatusBarColor(isDark);
    };

    if (settings.theme === 'dark') {
      applyTheme(true);
    } else if (settings.theme === 'light') {
      applyTheme(false);
    } else {
      // system
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  return null;
}

function AppShell() {
  const { isLocked, verifyPin, unlock } = usePinLock();

  const handleUnlock = async (pin: string) => {
    const ok = await verifyPin(pin);
    if (ok) unlock();
    return ok;
  };

  if (isLocked) return <LockScreen onUnlock={handleUnlock} />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/add" element={<AddPage />} />
        <Route path="/edit/:id" element={<EditPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SettingsProvider>
        <ThemeManager />
        <AppShell />
      </SettingsProvider>
    </BrowserRouter>
  );
}
