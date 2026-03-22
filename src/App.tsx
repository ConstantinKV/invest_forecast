import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import InvestmentList from './components/InvestmentList';
import InvestmentForm from './components/InvestmentForm';
import SettingsPage from './components/SettingsPage';
import { useInvestments } from './hooks/useInvestments';
import { SettingsProvider } from './contexts/SettingsContext';
import { useSettings } from './hooks/useSettings';
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

  return (
    <SettingsPage
      settings={settings}
      onUpdateTheme={updateTheme}
      onAddType={addInvestmentType}
      onUpdateType={updateInvestmentType}
      onDeleteType={deleteInvestmentType}
    />
  );
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

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ThemeManager />
        <Layout>
          <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/add" element={<AddPage />} />
            <Route path="/edit/:id" element={<EditPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </SettingsProvider>
    </BrowserRouter>
  );
}
