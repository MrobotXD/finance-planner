import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useFinance } from '../context/FinanceContext';
import { convertAmount, formatCurrency } from '../utils/currency';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#6b7280'];

type ChartView = 'category' | 'monthly' | 'trend' | 'debt';

export default function Charts() {
  const { state } = useFinance();
  const { expenses, debts, currency } = state;
  const [activeView, setActiveView] = useState<ChartView>('category');

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      const amt = convertAmount(e.amount, e.currency, currency);
      map[e.category] = (map[e.category] || 0) + amt;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);
  }, [expenses, currency]);

  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      const month = e.date.slice(0, 7);
      const amt = convertAmount(e.amount, e.currency, currency);
      map[month] = (map[month] || 0) + amt;
    });
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, total]) => ({ month: month.slice(5) + '/' + month.slice(2, 4), total: Math.round(total) }));
  }, [expenses, currency]);

  const trendData = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date)).slice(-20);
    let running = 0;
    return sorted.map(e => {
      running += convertAmount(e.amount, e.currency, currency);
      return { date: e.date.slice(5), amount: Math.round(convertAmount(e.amount, e.currency, currency)), cumulative: Math.round(running) };
    });
  }, [expenses, currency]);

  const debtData = useMemo(() => {
    return debts.map(d => ({
      name: d.creditor,
      principal: Math.round(convertAmount(d.principal, d.currency, currency)),
      interest: Math.round(convertAmount(d.principal * d.interestRate / 100 * (d.months / 12), d.currency, currency)),
    }));
  }, [debts, currency]);

  const views: { key: ChartView; label: string }[] = [
    { key: 'category', label: 'By Category' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'trend', label: 'Trend' },
    { key: 'debt', label: 'Debts' },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-lg">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</p>
          {payload.map((p) => (
            <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
              {p.name}: {formatCurrency(p.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-heading">Charts</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Interactive visualizations of your financial data</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-8 flex-wrap"
          >
            {views.map(v => (
              <button
                key={v.key}
                onClick={() => setActiveView(v.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeView === v.key
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                {v.label}
              </button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeView === 'category' && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
                >
                  <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-6">Expenses by Category</h2>
                  {categoryData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
                >
                  <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-6">Category Breakdown</h2>
                  {categoryData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => formatCurrency(v, currency)} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Amount" radius={[0, 6, 6, 0]}>
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>
              </>
            )}

            {activeView === 'monthly' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
              >
                <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-6">Monthly Spending</h2>
                {monthlyData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => formatCurrency(v, currency)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="total" name="Total" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            )}

            {activeView === 'trend' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
              >
                <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-6">Cumulative Spending Trend</h2>
                {trendData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => formatCurrency(v, currency)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="#10b981" strokeWidth={2} fill="url(#colorCumulative)" />
                      <Line type="monotone" dataKey="amount" name="Per Transaction" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            )}

            {activeView === 'debt' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
              >
                <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-6">Debt: Principal vs Interest</h2>
                {debtData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">No debts recorded</div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={debtData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => formatCurrency(v, currency)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="principal" name="Principal" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="interest" name="Interest" fill="#f87171" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}