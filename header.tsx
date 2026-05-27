import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, DollarSign, Menu, X, TrendingUp, LogOut } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './LanguageToggle';
import type { Currency } from '../types/finance';

export default function Header() {
  const { state, dispatch } = useFinance();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/expenses', label: t('nav.expenses') },
    { to: '/debts', label: t('nav.debts') },
    { to: '/charts', label: t('nav.charts') },
    { to: '/chatbot', label: t('nav.chatbot') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const toggleTheme = () =>
    dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' });

  const toggleCurrency = () =>
    dispatch({ type: 'SET_CURRENCY', payload: state.currency === 'COP' ? 'USD' : 'COP' as Currency });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-emerald-100 dark:border-slate-700'
          : 'bg-transparent backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-200">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            Fintrack
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle className="hidden sm:inline-flex" />

          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-slate-600 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-200"
            aria-label={t('a11y.toggleCurrency')}
          >
            <DollarSign className="w-3.5 h-3.5" />
            {state.currency}
          </button>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            aria-label={t('a11y.toggleTheme')}
          >
            {state.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900/30 transition-all duration-200"
            aria-label={t('nav.logout')}
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('nav.logout')}
          </button>

          <button
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('a11y.toggleMenu')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-6 py-4 flex flex-col gap-1">
          <div className="pb-2">
            <LanguageToggle />
          </div>
          <button
            onClick={() => {
              handleLogout();
              setMobileOpen(false);
            }}
            className="px-4 py-3 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 text-left"
          >
            {t('nav.logout')}
          </button>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
