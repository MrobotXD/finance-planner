import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-6">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
          <TrendingUp className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-6xl font-bold text-slate-800 dark:text-white font-heading mb-4">404</h1>
        <p className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">{t('notFound.title')}</p>
        <p className="text-slate-400 dark:text-slate-500 mb-8">{t('notFound.description')}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('notFound.back')}
        </Link>
      </div>
    </div>
  );
}
