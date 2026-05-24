import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  className?: string;
  variant?: 'pill' | 'compact';
}

export default function LanguageToggle({ className = '', variant = 'pill' }: Props) {
  const { locale, setLocale, t } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${className}`}
        aria-label={t('lang.toggle')}
      >
        <Languages className="w-3.5 h-3.5" />
        {locale === 'es' ? 'EN' : 'ES'}
      </button>
    );
  }

  return (
    <div
      className={`inline-flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden text-xs font-semibold ${className}`}
      role="group"
      aria-label={t('lang.toggle')}
    >
      {(['es', 'en'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`px-2.5 py-1.5 transition-colors ${
            locale === code
              ? 'bg-emerald-500 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {t(`lang.${code}`)}
        </button>
      ))}
    </div>
  );
}
