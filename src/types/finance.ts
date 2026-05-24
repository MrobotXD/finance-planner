export type Currency = 'COP' | 'USD';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Housing'
  | 'Health'
  | 'Entertainment'
  | 'Education'
  | 'Clothing'
  | 'Savings'
  | 'Other';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  currency: Currency;
}

export interface Debt {
  id: string;
  creditor: string;
  principal: number;
  interestRate: number;
  months: number;
  startDate: string;
  currency: Currency;
  paid: boolean;
}

export interface FinanceState {
  expenses: Expense[];
  debts: Debt[];
  currency: Currency;
  theme: 'light' | 'dark';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
}
