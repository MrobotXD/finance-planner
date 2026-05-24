import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, CreditCard, MessageSquare, ArrowRight, BarChart3 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { convertAmount, formatCurrency, calculateMonthlyPayment } from '../utils/currency';

export default function Dashboard() {
  const { state, loading } = useFinance();
  const { user } = useAuth();
  const { expenses, debts, currency } = state;

  const totalExpenses = expenses.reduce((sum, e) => sum + convertAmount(e.amount, e.currency, currency), 0);
  const totalDebt = debts.filter((d) => !d.paid).reduce((sum, d) => sum + convertAmount(d.principal, d.currency, currency), 0);
  const totalMonthly = debts
    .filter((d) => !d.paid)
    .reduce(
      (sum, d) =>
        sum + convertAmount(calculateMonthlyPayment(d.principal, d.interestRate, d.months), d.currency, currency),
      0
    );
  const activeDebts = debts.filter((d) => !d.paid).length;
  const recentExpenses = expenses.slice(0, 5);

  const features = [
    { icon: TrendingDown, title: 'Expense Tracking', desc: 'Categorize and monitor every peso and dollar you spend.', to: '/expenses', color: 'text-rose-500' },
    { icon: CreditCard, title: 'Debt Manager', desc: 'Calculate interest, monthly payments, and payoff timelines.', to: '/debts', color: 'text-amber-500' },
    { icon: BarChart3, title: 'Interactive Charts', desc: 'Visualize your finances with beautiful, interactive graphs.', to: '/charts', color: 'text-blue-500' },
    { icon: MessageSquare, title: 'AI Finance Advisor', desc: 'Get personalized financial advice from your AI chatbot.', to: '/chatbot', color: 'text-emerald-500' },
  ];

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
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white font-heading mb-2">
              Financial Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Hola, {user?.email} — tu resumen en {currency}.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: 'Total Expenses', value: formatCurrency(totalExpenses, currency), subtitle: `${expenses.length} transactions`, icon: TrendingDown, color: 'rose' as const },
              { title: 'Total Debt', value: formatCurrency(totalDebt, currency), subtitle: `${activeDebts} active debts`, icon: CreditCard, color: 'amber' as const },
              { title: 'Monthly Payments', value: formatCurrency(totalMonthly, currency), subtitle: 'Debt obligations', icon: TrendingUp, color: 'blue' as const },
              { title: 'Transactions', value: String(expenses.length), subtitle: 'All time', icon: BarChart3, color: 'emerald' as const },
            ].map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <StatCard {...card} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">Recent Expenses</h2>
                <Link to="/expenses" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {recentExpenses.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No expenses yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((expense, i) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{expense.description}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {expense.category} · {expense.date}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(convertAmount(expense.amount, expense.currency, currency), currency)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
            >
              <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading mb-6">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  { to: '/expenses', label: 'Add Expense', icon: TrendingDown, color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' },
                  { to: '/debts', label: 'Add Debt', icon: CreditCard, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
                  { to: '/charts', label: 'View Charts', icon: BarChart3, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
                  { to: '/chatbot', label: 'Ask AI Advisor', icon: MessageSquare, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
                ].map(({ to, label, icon: Icon, color }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 ml-auto group-hover:text-emerald-500" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-6 bg-white dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link
                    to={f.to}
                    className="block p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <f.icon className={`w-6 h-6 ${f.color} mb-4`} />
                    <h3 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
