import { en } from './en';
import { es } from './es';
import type { ExpenseCategory } from '../types/finance';

export type Locale = 'es' | 'en';
export type TranslationKey = string;

const dictionaries = { en, es };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value: unknown = dictionaries[locale];
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  if (typeof value !== 'string') return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, name) => String(params[name] ?? ''));
}

export function categoryKey(category: ExpenseCategory | 'All'): string {
  return `categories.${category}`;
}

export function getChatbotResponse(
  locale: Locale,
  message: string,
  context: string
): string {
  const r = dictionaries[locale].chatbot.responses;
  const lower = message.toLowerCase();
  if (lower.includes('hola') || lower.includes('hello') || lower.includes('hi')) return r.greeting;
  if (lower.includes('budget') || lower.includes('presupuesto') || lower.includes('50/30')) return r.budget;
  if (lower.includes('debt') || lower.includes('deuda') || lower.includes('loan') || lower.includes('préstamo'))
    return r.debt + '\n\n' + context;
  if (lower.includes('sav') || lower.includes('ahorro') || lower.includes('emergency') || lower.includes('emergencia'))
    return r.savings;
  if (lower.includes('invest') || lower.includes('invert') || lower.includes('stock') || lower.includes('accion'))
    return r.invest;
  if (lower.includes('inflation') || lower.includes('inflacion') || lower.includes('inflación')) return r.inflation;
  if (lower.includes('emergency fund') || lower.includes('fondo de emergencia')) return r.emergency;
  if (lower.includes('credit') || lower.includes('crédito') || lower.includes('score')) return r.credit;
  if (lower.includes('retire') || lower.includes('pension') || lower.includes('jubilacion') || lower.includes('jubilación'))
    return r.retire;
  if (lower.includes('cop') || lower.includes('usd') || lower.includes('dollar') || lower.includes('dolar') || lower.includes('exchange'))
    return r.cop;
  if (lower.includes('expense') || lower.includes('gasto') || lower.includes('spend')) return r.expense + '\n\n' + context;
  return r.default;
}

export function detectLocale(): Locale {
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('es')) {
    return 'es';
  }
  return 'en';
}
