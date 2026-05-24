import React from 'react';
import type { ExpenseCategory } from '../types/finance';

const categoryConfig: Record<ExpenseCategory, { color: string; bg: string }> = {
  Food: { color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  Transport: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  Housing: { color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  Health: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  Entertainment: { color: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  Education: { color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  Clothing: { color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  Savings: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  Other: { color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-700/50' },
};

export default function CategoryBadge({ category }: { category: ExpenseCategory }) {
  const { color, bg } = categoryConfig[category];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${color}`}>
      {category}
    </span>
  );
}