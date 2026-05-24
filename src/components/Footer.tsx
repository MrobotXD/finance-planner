import React from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, Github, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const productLinks = [
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/expenses', label: t('nav.expenses') },
    { to: '/debts', label: t('nav.debts') },
    { to: '/charts', label: t('nav.charts') },
  ];

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-heading text-lg font-bold text-white">Fintrack</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">{t('footer.tagline')}</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">{t('footer.product')}</h3>
            <ul className="space-y-2 text-sm">
              {productLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className="hover:text-emerald-400 transition-colors duration-200">
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">{t('footer.tools')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/chatbot" className="hover:text-emerald-400 transition-colors duration-200">
                  {t('nav.chatbot')}
                </NavLink>
              </li>
              <li><span className="text-slate-500">{t('footer.excelImport')}</span></li>
              <li><span className="text-slate-500">COP / USD</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">{t('footer.rights')}</p>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="GitHub" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all duration-200">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all duration-200">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all duration-200">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
