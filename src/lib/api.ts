const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getToken(): string | null {
  return localStorage.getItem('authToken');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    if (!API_BASE && import.meta.env.PROD) {
      throw new Error(
        'La web no está enlazada a la API. En Render → Static Site → VITE_API_URL = URL de tu API (https://...) y haz Redeploy.'
      );
    }
    if (!API_BASE) {
      throw new Error('No se pudo conectar. ¿Está corriendo la API en local? (npm run dev en server/)');
    }
    throw new Error(
      `No se pudo conectar con la API (${API_BASE}). En plan gratis espera ~1 min y reintenta, o revisa que la API esté en verde.`
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Error de servidor');
  }
  return data as T;
}

export const authApi = {
  register: (email: string, password: string) =>
    apiFetch<{ token: string; user: { id: string; email: string; currency: string; theme: string } }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: { id: string; email: string; currency: string; theme: string } }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  me: () =>
    apiFetch<{ user: { id: string; email: string; currency: string; theme: string } }>('/api/auth/me'),
};

export const financeApi = {
  getState: () =>
    apiFetch<{
      expenses: import('../types/finance').Expense[];
      debts: import('../types/finance').Debt[];
      currency: import('../types/finance').Currency;
      theme: 'light' | 'dark';
    }>('/api/finance/state'),
  updatePreferences: (prefs: { currency?: string; theme?: string }) =>
    apiFetch('/api/finance/preferences', { method: 'PATCH', body: JSON.stringify(prefs) }),
  createExpense: (expense: Omit<import('../types/finance').Expense, 'id'>) =>
    apiFetch<import('../types/finance').Expense>('/api/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),
  importExpenses: (expenses: Omit<import('../types/finance').Expense, 'id'>[]) =>
    apiFetch<import('../types/finance').Expense[]>('/api/finance/expenses/import', {
      method: 'POST',
      body: JSON.stringify({ expenses }),
    }),
  deleteExpense: (id: string) =>
    apiFetch(`/api/finance/expenses/${id}`, { method: 'DELETE' }),
  createDebt: (debt: Omit<import('../types/finance').Debt, 'id' | 'paid'>) =>
    apiFetch<import('../types/finance').Debt>('/api/finance/debts', {
      method: 'POST',
      body: JSON.stringify(debt),
    }),
  deleteDebt: (id: string) => apiFetch(`/api/finance/debts/${id}`, { method: 'DELETE' }),
  toggleDebtPaid: (id: string) =>
    apiFetch<import('../types/finance').Debt>(`/api/finance/debts/${id}/toggle-paid`, { method: 'PATCH' }),
};
