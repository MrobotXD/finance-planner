import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, CreditCard, TrendingDown } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AddDebtModal from '../components/AddDebtModal';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { convertAmount, formatCurrency, calculateMonthlyPayment, calculateTotalInterest } from '../utils/currency';

export default function Debts() {
  const { state, dispatch } = useFinance();
  const { t } = useLanguage();
  const { debts, currency } = state;
  const [addOpen, setAddOpen] = useState(false);

  const activeDebts = debts.filter(d => !d.paid);
  const paidDebts = debts.filter(d => d.paid);

  const totalPrincipal = activeDebts.reduce((sum, d) => sum + convertAmount(d.principal, d.currency, currency), 0);
  const totalInterest = activeDebts.reduce((sum, d) => sum + convertAmount(calculateTotalInterest(d.principal, d.interestRate, d.months), d.currency, currency), 0);
  const totalMonthly = activeDebts.reduce((sum, d) => sum + convertAmount(calculateMonthlyPayment(d.principal, d.interestRate, d.months), d.currency, currency), 0);

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
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-heading">{t('debts.title')}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t('debts.subtitle')}</p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              {t('debts.addDebt')}
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              { label: t('debts.totalPrincipal'), value: formatCurrency(totalPrincipal, currency), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: t('debts.totalInterest'), value: formatCurrency(totalInterest, currency), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { label: t('debts.monthlyPayments'), value: formatCurrency(totalMonthly, currency), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${item.bg} rounded-2xl p-5 border border-white/50 dark:border-slate-700/50`}
              >
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{item.label}</p>
                <p className={`text-2xl font-bold font-heading ${item.color}`}>{item.value}</p>
              </motion.div>
            ))}
          </div>

          {activeDebts.length === 0 && paidDebts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"
            >
              <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t('debts.emptyTitle')}</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t('debts.emptySubtitle')}</p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {activeDebts.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading mb-4">{t('debts.activeDebts')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {activeDebts.map((debt, i) => {
                      const monthly = calculateMonthlyPayment(debt.principal, debt.interestRate, debt.months);
                      const interest = calculateTotalInterest(debt.principal, debt.interestRate, debt.months);
                      const displayPrincipal = convertAmount(debt.principal, debt.currency, currency);
                      const displayMonthly = convertAmount(monthly, debt.currency, currency);
                      const displayInterest = convertAmount(interest, debt.currency, currency);
                      const interestPct = debt.principal > 0 ? (interest / (debt.principal + interest)) * 100 : 0;

                      return (
                        <motion.div
                          key={debt.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-slate-800 dark:text-white font-heading">{debt.creditor}</h3>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('debts.started', { date: debt.startDate, months: debt.months })}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => dispatch({ type: 'TOGGLE_DEBT_PAID', payload: debt.id })}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-500 transition-all duration-200"
                                aria-label={t('debts.markPaid')}
                              >
                                <Circle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => dispatch({ type: 'DELETE_DEBT', payload: debt.id })}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-all duration-200"
                                aria-label={t('debts.delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                              <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{t('debts.principal')}</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(displayPrincipal, currency)}</p>
                            </div>
                            <div className="text-center p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                              <p className="text-xs text-rose-400 mb-0.5">{t('debts.interest')}</p>
                              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(displayInterest, currency)}</p>
                            </div>
                            <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                              <p className="text-xs text-emerald-500 mb-0.5">{t('debts.monthly')}</p>
                              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(displayMonthly, currency)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <span>{t('debts.annualRate', { rate: debt.interestRate })}</span>
                            <span>{t('debts.interestShare', { pct: interestPct.toFixed(1) })}</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${interestPct}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className="h-full bg-rose-400 rounded-full"
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {paidDebts.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-500 dark:text-slate-400 font-heading mb-4">{t('debts.paidDebts')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paidDebts.map((debt) => (
                      <div
                        key={debt.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 opacity-60"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <div>
                              <p className="font-medium text-slate-700 dark:text-slate-300">{debt.creditor}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">{formatCurrency(convertAmount(debt.principal, debt.currency, currency), currency)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => dispatch({ type: 'TOGGLE_DEBT_PAID', payload: debt.id })}
                              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200"
                            >
                              {t('debts.reopen')}
                            </button>
                            <button
                              onClick={() => dispatch({ type: 'DELETE_DEBT', payload: debt.id })}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-all duration-200"
                              aria-label="Delete debt"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <AddDebtModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}