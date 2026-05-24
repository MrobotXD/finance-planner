import type { Currency } from '../types/finance';

export const COP_TO_USD = 0.00024;
export const USD_TO_COP = 4150;

export function convertAmount(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  if (from === 'COP' && to === 'USD') return amount * COP_TO_USD;
  if (from === 'USD' && to === 'COP') return amount * USD_TO_COP;
  return amount;
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'COP') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function calculateTotalInterest(principal: number, annualRate: number, months: number): number {
  const monthly = calculateMonthlyPayment(principal, annualRate, months);
  return monthly * months - principal;
}