import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { convertAmount, formatCurrency } from '../utils/currency';
import { parseExcelToExpenses } from '../utils/excelImport';
import type { ExpenseCategory, Currency } from '../types/finance';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#6b7280'];

interface BudgetItem {
  id: string;
  category: ExpenseCategory;
  amount: number;
  currency: Currency;
}

// FIX 1: formatCurrency solo acepta 2 argumentos
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value, 'USD' as Currency)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Budget() {
  const { t } = useLanguage();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [formData, setFormData] = useState<{ category: ExpenseCategory; amount: string; currency: Currency }>({
    category: 'Food',
    amount: '',
    currency: 'COP',
  });
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const amountValue = parseFloat(formData.amount.replace(/[^0-9.-]/g, '') || '0');
  const isValid = !isNaN(amountValue) && amountValue > 0 && formData.category.length > 0;

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    budgetItems.forEach(item => {
      const amt = convertAmount(item.amount, item.currency, 'USD');
      map[item.category] = (map[item.category] || 0) + amt;
    });
    return Object.entries(map)
      .map(([name, value]) => ({
        name: t(`category.${name}`) || name,
        value: Math.round(value),
      }))
      .sort((a, b) => b.value - a.value);
  }, [budgetItems, t]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const newItem: BudgetItem = {
      id: `budget-${Date.now()}-${Math.random()}`,
      category: formData.category,
      amount: amountValue,
      currency: formData.currency,
    };
    setBudgetItems(prev => [newItem, ...prev]);
    setFormData({ category: 'Food', amount: '', currency: 'COP' });
  };

  const handleDeleteItem = (id: string) => {
    setBudgetItems(prev => prev.filter(item => item.id !== id));
  };

  // FIX 2: usar BudgetItem en vez del tipo Expense que no existe en este archivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const expenses = await parseExcelToExpenses(file);
      const newItems: BudgetItem[] = expenses.map(exp => ({
        id: exp.id,
        category: exp.category,
        amount: exp.amount,
        currency: exp.currency,
      }));
      setBudgetItems(prev => [...prev, ...newItems]);
      alert(t('budget.importSuccess', { count: newItems.length }));
    } catch (err) {
      console.error(err);
      alert(t('budget.importError'));
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <section className="py-10 px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-heading">{t('budget.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('budget.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
            >
              <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-6">{t('budget.addItem')}</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('budget.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ExpenseCategory }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {['Food','Transport','Housing','Health','Entertainment','Education','Clothing','Savings','Other'].map((cat) => (
                      <option key={cat} value={cat}>
                        {t(`category.${cat}`) || cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('budget.amount')}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      placeholder="0"
                    />
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as Currency }))}
                      className="ml-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      <option value="COP">COP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? t('budget.adding') : t('budget.addItem')}
                </button>
              </form>
            </motion.div>

            {/* List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
            >
              <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-6">{t('budget.itemsList')}</h2>
              {budgetItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{t('budget.noItems')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:border-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('budget.category')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('budget.amount')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('budget.currency')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('budget.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:border-slate-700">
                      {budgetItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{t(`category.${item.category}`) || item.category}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{formatCurrency(item.amount, item.currency)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{item.currency}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">
                            <button onClick={() => handleDeleteItem(item.id)} className="text-rose-500 hover:text-rose-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>

          {/* FIX 3: etiquetas </motion.div> faltantes — ahora correctas */}

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mt-8"
          >
            <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-6">{t('budget.chart')}</h2>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                <Loader2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">{t('budget.noData')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Import */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mt-8"
          >
            <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-6">{t('budget.import')}</h2>
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('budget.importDescription')}</p>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <label className="flex items-center cursor-pointer rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  <span>{t('budget.selectFile')}</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <button
                  disabled={importing}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  {importing ? t('budget.importing') : t('budget.import')}
                </button>
              </div>
            </div>
          </motion.div>

        </section>
      </main>
      <Footer />
    </div>
  );
}
