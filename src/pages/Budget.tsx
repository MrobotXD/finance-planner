import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Upload, Loader2, Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';
import { parseExcelToExpenses } from '../utils/excelImport';
import type { ExpenseCategory, Currency } from '../types/finance';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ec4899',
  '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#6b7280',
];

const ALL_CATEGORIES: ExpenseCategory[] = [
  'Food', 'Transport', 'Housing', 'Health',
  'Entertainment', 'Education', 'Clothing', 'Savings', 'Other',
];

interface BudgetCategory {
  category: ExpenseCategory;
  percentage: number;
  color: string;
}

const CustomTooltip = ({
  active, payload, totalBudget, currency,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
  totalBudget: number;
  currency: Currency;
}) => {
  if (active && payload && payload.length) {
    const p = payload[0];
    const amount = (p.value / 100) * totalBudget;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{p.name}</p>
        <p className="text-sm font-bold" style={{ color: p.payload.color }}>
          {p.value.toFixed(1)}% — {formatCurrency(amount, currency)}
        </p>
      </div>
    );
  }
  return null;
};

export default function Budget() {
  const { t } = useLanguage();

  const [totalBudget, setTotalBudget] = useState<number>(3000000);
  const [totalInput, setTotalInput] = useState<string>('3000000');
  const [currency, setCurrency] = useState<Currency>('COP');

  const [categories, setCategories] = useState<BudgetCategory[]>([
    { category: 'Housing',       percentage: 30, color: COLORS[0] },
    { category: 'Food',          percentage: 20, color: COLORS[1] },
    { category: 'Transport',     percentage: 15, color: COLORS[2] },
    { category: 'Savings',       percentage: 15, color: COLORS[3] },
    { category: 'Health',        percentage: 10, color: COLORS[4] },
    { category: 'Entertainment', percentage: 10, color: COLORS[5] },
  ]);

  const [importing, setImporting] = useState(false);
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Education');

  const totalPct = useMemo(
    () => categories.reduce((a, c) => a + c.percentage, 0),
    [categories],
  );

  const chartData = useMemo(
    () => categories.map(c => ({
      name: t(`category.${c.category}`) || c.category,
      value: c.percentage,
      color: c.color,
    })),
    [categories, t],
  );

  function handleSliderChange(index: number, newPct: number) {
    setCategories(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], percentage: newPct };
      return updated;
    });
  }

  function handleAddCategory() {
    if (categories.find(c => c.category === newCategory)) return;
    const colorIndex = categories.length % COLORS.length;
    setCategories(prev => [
      ...prev,
      { category: newCategory, percentage: 0, color: COLORS[colorIndex] },
    ]);
  }

  function handleDeleteCategory(index: number) {
    setCategories(prev => prev.filter((_, i) => i !== index));
  }

  function handleNormalize() {
    if (totalPct === 0) return;
    setCategories(prev =>
      prev.map(c => ({ ...c, percentage: Math.round((c.percentage / totalPct) * 100) }))
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const expenses = await parseExcelToExpenses(file);
      const totals: Record<string, number> = {};
      let grandTotal = 0;
      expenses.forEach(exp => {
        totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
        grandTotal += exp.amount;
      });
      if (grandTotal === 0) return;
      const imported: BudgetCategory[] = Object.entries(totals).map(([cat, amt], i) => ({
        category: cat as ExpenseCategory,
        percentage: Math.round((amt / grandTotal) * 100),
        color: COLORS[i % COLORS.length],
      }));
      setCategories(imported);
      setTotalBudget(grandTotal);
      setTotalInput(String(Math.round(grandTotal)));
      alert(t('budget.importSuccess', { count: expenses.length }));
    } catch (err) {
      console.error(err);
      alert(t('budget.importError'));
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  const availableToAdd = ALL_CATEGORIES.filter(
    cat => !categories.find(c => c.category === cat),
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <section className="py-10 px-6 max-w-7xl mx-auto">

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-heading">
              {t('budget.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('budget.subtitle')}</p>
          </motion.div>

          {/* Total Budget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mb-6"
          >
            <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-4">
              {t('budget.totalBudget') || 'Presupuesto total del mes'}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="number"
                value={totalInput}
                onChange={e => {
                  setTotalInput(e.target.value);
                  const n = parseFloat(e.target.value);
                  if (!isNaN(n) && n > 0) setTotalBudget(n);
                }}
                className="flex-1 min-w-[180px] px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-lg font-semibold"
                placeholder="0"
              />
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="COP">COP</option>
                <option value="USD">USD</option>
              </select>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                = <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalBudget, currency)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Chart + Sliders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Pie chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col"
            >
              <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-2">
                {t('budget.chart') || 'Distribución'}
              </h2>

              <div className={`text-xs font-medium mb-4 px-3 py-1 rounded-full inline-flex self-start gap-1 ${
                totalPct === 100
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : totalPct > 100
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {totalPct === 100
                  ? '✓ 100% asignado'
                  : totalPct > 100
                  ? `⚠ ${totalPct}% — excede el 100%`
                  : `${totalPct}% asignado — ${100 - totalPct}% sin asignar`}
              </div>

              {categories.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                  Agrega categorías para ver el gráfico
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      dataKey="value"
                      nameKey="name"
                      labelLine={false}
                      label={({ value }) => value > 5 ? `${value}%` : ''}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={
                      <CustomTooltip totalBudget={totalBudget} currency={currency} />
                    } />
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: 12, color: 'inherit' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Sliders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading">
                  {t('budget.categories') || 'Categorías'}
                </h2>
                {totalPct !== 100 && totalPct > 0 && (
                  <button
                    onClick={handleNormalize}
                    className="text-xs px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    Normalizar a 100%
                  </button>
                )}
              </div>

              <div className="space-y-5 max-h-[360px] overflow-y-auto pr-1">
                {categories.map((cat, i) => {
                  const amount = (cat.percentage / 100) * totalBudget;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: cat.color }}
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t(`category.${cat.category}`) || cat.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatCurrency(amount, currency)}
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={cat.percentage}
                            onChange={e => handleSliderChange(i, Math.min(100, Math.max(0, Number(e.target.value))))}
                            className="w-14 text-right text-sm font-bold px-1 py-0.5 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                          />
                          <span className="text-sm text-slate-400">%</span>
                          <button
                            onClick={() => handleDeleteCategory(i)}
                            className="text-slate-300 hover:text-rose-400 transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={cat.percentage}
                        onChange={e => handleSliderChange(i, Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${cat.color} ${cat.percentage}%, #e2e8f0 ${cat.percentage}%)`,
                          accentColor: cat.color,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {availableToAdd.length > 0 && (
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as ExpenseCategory)}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {availableToAdd.map(cat => (
                      <option key={cat} value={cat}>
                        {t(`category.${cat}`) || cat}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddCategory}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Summary table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mb-6"
          >
            <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-4">
              Resumen
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoría</th>
                    <th className="pb-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">%</th>
                    <th className="pb-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {categories.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 text-sm font-medium text-slate-800 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                          {t(`category.${cat.category}`) || cat.category}
                        </div>
                      </td>
                      <td className="py-3 text-sm text-right text-slate-600 dark:text-slate-300">
                        {cat.percentage}%
                      </td>
                      <td className="py-3 text-sm font-semibold text-right text-slate-800 dark:text-white">
                        {formatCurrency((cat.percentage / 100) * totalBudget, currency)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-200 dark:border-slate-600">
                    <td className="pt-3 text-sm font-bold text-slate-800 dark:text-white">Total</td>
                    <td className={`pt-3 text-sm font-bold text-right ${totalPct > 100 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {totalPct}%
                    </td>
                    <td className="pt-3 text-sm font-bold text-right text-slate-800 dark:text-white">
                      {formatCurrency(totalBudget, currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Import */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
          >
            <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-2">
              {t('budget.import') || 'Importar desde Excel / CSV'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {t('budget.importDescription') || 'Sube un archivo .xlsx o .csv con tus gastos y calcularemos los porcentajes automáticamente.'}
            </p>
            <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-medium">
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {importing
                ? (t('budget.importing') || 'Importando...')
                : (t('budget.selectFile') || 'Seleccionar archivo')}
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
                disabled={importing}
              />
            </label>
          </motion.div>

        </section>
      </main>
      <Footer />
    </div>
  );
}
