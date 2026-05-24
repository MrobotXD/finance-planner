import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import type { ExpenseCategory } from '../types/finance';

type FormData = {
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  currency: 'COP' | 'USD';
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const categories: ExpenseCategory[] = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Education', 'Clothing', 'Savings', 'Other'];

export default function AddExpenseModal({ open, onClose }: Props) {
  const { state, dispatch } = useFinance();
  const { t, categoryLabel } = useLanguage();

  const schema = useMemo(
    () =>
      z.object({
        description: z.string().min(1, t('modal.validation.descriptionRequired')),
        amount: z.number({ invalid_type_error: t('modal.validation.amountInvalid') }).positive(t('modal.validation.amountPositive')),
        category: z.enum(['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Education', 'Clothing', 'Savings', 'Other']),
        date: z.string().min(1, t('modal.validation.dateRequired')),
        currency: z.enum(['COP', 'USD']),
      }),
    [t]
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: state.currency, date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = (data: FormData) => {
    dispatch({
      type: 'ADD_EXPENSE',
      payload: { ...data, id: `exp-${Date.now()}` },
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
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">{t('modal.addExpense')}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('modal.description')}</label>
                <input
                  {...register('description')}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  placeholder={t('modal.descriptionPlaceholder')}
                />
                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('modal.amount')}</label>
                  <input
                    {...register('amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                    placeholder="0.00"
                  />
                  {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('modal.currency')}</label>
                  <select
                    {...register('currency')}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  >
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('modal.category')}</label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabel(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('modal.date')}</label>
                <input
                  {...register('date')}
                  type="date"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                />
                {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  {t('modal.addExpense')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
