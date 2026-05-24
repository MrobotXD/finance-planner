import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Trash2, Search, Filter } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryBadge from '../components/CategoryBadge';
import AddExpenseModal from '../components/AddExpenseModal';
import ImportExcelModal from '../components/ImportExcelModal';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { convertAmount, formatCurrency } from '../utils/currency';
import type { ExpenseCategory } from '../types/finance';

const ALL_CATEGORIES: (ExpenseCategory | 'All')[] = ['All', 'Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Education', 'Clothing', 'Savings', 'Other'];

export default function Expenses() {
  const { state, dispatch } = useFinance();
  const { t, categoryLabel } = useLanguage();
  const { expenses, currency } = state;
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'All'>('All');

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'All' || e.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [expenses, search, categoryFilter]);

  const totalFiltered = filtered.reduce((sum, e) => sum + convertAmount(e.amount, e.currency, currency), 0);

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      const amt = convertAmount(e.amount, e.currency, currency);
      map[e.category] = (map[e.category] || 0) + amt;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [expenses, currency]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <section className="py-10 px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-heading">{t('expenses.title')}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t('expenses.subtitle')}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setImportOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                {t('expenses.importCsv')}
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                {t('expenses.addExpense')}
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5"
            >
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('expenses.search')}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value as ExpenseCategory | 'All')}
                    className="pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  >
                    {ALL_CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('expenses.count', { count: filtered.length })}</p>
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                  {t('expenses.total')}: {formatCurrency(totalFiltered, currency)}
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{t('expenses.noResults')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((expense, i) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{expense.description}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{expense.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <CategoryBadge category={expense.category} />
                        <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 min-w-[80px] text-right">
                          {formatCurrency(convertAmount(expense.amount, expense.currency, currency), currency)}
                        </span>
                        <button
                          onClick={() => dispatch({ type: 'DELETE_EXPENSE', payload: expense.id })}
                          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-400 hover:text-rose-600 transition-all duration-200"
                          aria-label={t('expenses.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5"
            >
              <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-4">{t('expenses.topCategories')}</h2>
              {categoryTotals.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">{t('expenses.noData')}</p>
              ) : (
                <div className="space-y-3">
                  {categoryTotals.map(([cat, total]) => {
                    const max = categoryTotals[0][1];
                    const pct = (total / max) * 100;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{categoryLabel(cat as ExpenseCategory)}</span>
                          <span className="text-slate-500 dark:text-slate-400">{formatCurrency(total, currency)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <AddExpenseModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ImportExcelModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}