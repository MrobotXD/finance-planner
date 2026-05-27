import type { Expense, ExpenseCategory } from '../types/finance';
import * as XLSX from 'xlsx';

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

export async function parseExcelToExpenses(file: File): Promise<Expense[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('No data');
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        // Convert to CSV string then parse as CSV (assuming the Excel has same structure as CSV)
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const expenses = parseCSVToExpenses(csv);
        resolve(expenses);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsArrayBuffer(file);
  });
}