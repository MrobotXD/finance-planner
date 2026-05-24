import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { calculateMonthlyPayment, calculateTotalInterest, formatCurrency } from '../utils/currency';

const schema = z.object({
  creditor: z.string().min(1, 'Creditor is required'),
  principal: z.number({ invalid_type_error: 'Enter a valid amount' }).positive(),
  interestRate: z.number({ invalid_type_error: 'Enter a valid rate' }).min(0).max(100),
  months: z.number({ invalid_type_error: 'Enter valid months' }).int().positive(),
  startDate: z.string().min(1),
  currency: z.enum(['COP', 'USD']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddDebtModal({ open, onClose }: Props) {
  const { state, dispatch } = useFinance();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: state.currency,
      startDate: new Date().toISOString().split('T')[0],
      interestRate: 12,
      months: 12,
    },
  });

  const watchedValues = watch();
  const principal = watchedValues.principal || 0;
  const rate = watchedValues.interestRate || 0;
  const months = watchedValues.months || 1;
  const currency = watchedValues.currency || 'COP';

  const monthly = calculateMonthlyPayment(principal, rate, months);
  const totalInterest = calculateTotalInterest(principal, rate, months);

  const onSubmit = (data: FormData) => {
    dispatch({
      type: 'ADD_DEBT',
      payload: { ...data, id: `debt-${Date.now()}`, paid: false },
    });
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">Add Debt</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Creditor / Lender</label>
                <input
                  {...register('creditor')}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  placeholder="e.g. Bancolombia"
                />
                {errors.creditor && <p className="text-xs text-rose-500 mt-1">{errors.creditor.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Principal</label>
                  <input
                    {...register('principal', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                    placeholder="0.00"
                  />
                  {errors.principal && <p className="text-xs text-rose-500 mt-1">{errors.principal.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                  <select
                    {...register('currency')}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  >
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Annual Rate (%)</label>
                  <input
                    {...register('interestRate', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  />
                  {errors.interestRate && <p className="text-xs text-rose-500 mt-1">{errors.interestRate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Term (months)</label>
                  <input
                    {...register('months', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  />
                  {errors.months && <p className="text-xs text-rose-500 mt-1">{errors.months.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <input
                  {...register('startDate')}
                  type="date"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                />
              </div>

              {principal > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Calculation Preview</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Monthly payment</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(monthly, currency as 'COP' | 'USD')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Total interest</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(totalInterest, currency as 'COP' | 'USD')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Total to pay</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(principal + totalInterest, currency as 'COP' | 'USD')}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  Add Debt
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}