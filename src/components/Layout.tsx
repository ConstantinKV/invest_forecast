import { Link, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

function ListIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <img src="/invest_forecast.png" alt="Invest Forecast" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-bold text-green-600 dark:text-green-400">Invest Forecast</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400'
            }`}
          >
            Investments
          </Link>
          <Link
            to="/add"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            + Add Investment
          </Link>
          <Link
            to="/settings"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/settings')
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400'
            }`}
          >
            Settings
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around h-16 z-50">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            isActive('/') ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <ListIcon />
          <span className="text-xs font-medium">Investments</span>
        </Link>

        <Link
          to="/add"
          className="flex flex-col items-center justify-center flex-1 h-full"
        >
          <div className="bg-green-600 rounded-full p-3 -mt-6 shadow-lg hover:bg-green-700 transition-colors">
            <PlusIcon />
            <span className="sr-only">Add</span>
          </div>
        </Link>

        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            isActive('/settings') ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <GearIcon />
          <span className="text-xs font-medium">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
