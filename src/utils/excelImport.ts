import type { Expense, ExpenseCategory } from '../types/finance';

const VALID_CATEGORIES: ExpenseCategory[] = [
  'Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Education', 'Clothing', 'Savings', 'Other'
];

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCSVToExpenses(csvText: string): Expense[] {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const expenses: Expense[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 3) continue;

    const description = cols[0] || 'Imported';
    const amount = parseFloat(cols[1]?.replace(/[^0-9.-]/g, '') || '0');
    const rawCategory = cols[2] || 'Other';
    const category: ExpenseCategory = VALID_CATEGORIES.includes(rawCategory as ExpenseCategory)
      ? (rawCategory as ExpenseCategory)
      : 'Other';
    const date = cols[3] || new Date().toISOString().split('T')[0];
    const currency = cols[4]?.toUpperCase() === 'USD' ? 'USD' : 'COP';

    if (!isNaN(amount) && amount > 0) {
      expenses.push({
        id: `import-${Date.now()}-${i}`,
        description,
        amount,
        category,
        date,
        currency,
      });
    }
  }

  return expenses;
}