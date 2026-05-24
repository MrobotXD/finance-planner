import React from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
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
            <p className="text-sm leading-relaxed max-w-xs">
              Your personal finance companion. Track expenses, manage debts, and grow your wealth with clarity.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'Dashboard' },
                { to: '/expenses', label: 'Expenses' },
                { to: '/debts', label: 'Debts' },
                { to: '/charts', label: 'Charts' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className="hover:text-emerald-400 transition-colors duration-200">
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><NavLink to="/chatbot" className="hover:text-emerald-400 transition-colors duration-200">AI Advisor</NavLink></li>
              <li><span className="text-slate-500">Excel Import</span></li>
              <li><span className="text-slate-500">COP / USD</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© 2026 Fintrack. All rights reserved.</p>
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