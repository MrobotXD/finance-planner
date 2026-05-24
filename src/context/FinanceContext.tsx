import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import type { FinanceState, Expense, Debt, Currency } from '../types/finance';
import { financeApi } from '../lib/api';
import { useAuth } from './AuthContext';

type Action =
  | { type: 'LOAD_STATE'; payload: FinanceState }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'IMPORT_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'DELETE_DEBT'; payload: string }
  | { type: 'TOGGLE_DEBT_PAID'; payload: string }
  | { type: 'UPDATE_DEBT'; payload: Debt }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' };

const emptyState: FinanceState = {
  expenses: [],
  debts: [],
  currency: 'COP',
  theme: 'light',
};

function reducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) };
    case 'IMPORT_EXPENSES':
      return { ...state, expenses: [...action.payload, ...state.expenses] };
    case 'ADD_DEBT':
      return { ...state, debts: [action.payload, ...state.debts] };
    case 'DELETE_DEBT':
      return { ...state, debts: state.debts.filter((d) => d.id !== action.payload) };
    case 'UPDATE_DEBT':
      return {
        ...state,
        debts: state.debts.map((d) => (d.id === action.payload.id ? action.payload : d)),
      };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}

interface FinanceContextType {
  state: FinanceState;
  loading: boolean;
  dispatch: React.Dispatch<Action>;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, emptyState);
  const [loading, setLoading] = useState(false);
  const syncing = useRef(false);

  const loadFromServer = useCallback(async () => {
    if (!user) {
      dispatch({ type: 'LOAD_STATE', payload: emptyState });
      return;
    }
    setLoading(true);
    try {
      const data = await financeApi.getState();
      dispatch({
        type: 'LOAD_STATE',
        payload: {
          expenses: data.expenses,
          debts: data.debts,
          currency: data.currency,
          theme: data.theme,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const syncDispatch = useCallback(
    async (action: Action) => {
      if (!user) return;

      if (action.type === 'SET_CURRENCY') {
        dispatch(action);
        await financeApi.updatePreferences({ currency: action.payload });
        return;
      }
      if (action.type === 'SET_THEME') {
        dispatch(action);
        await financeApi.updatePreferences({ theme: action.payload });
        return;
      }

      if (syncing.current) return;
      syncing.current = true;

      try {
        switch (action.type) {
          case 'ADD_EXPENSE': {
            const { id: _id, ...body } = action.payload;
            const created = await financeApi.createExpense(body);
            dispatch({ type: 'ADD_EXPENSE', payload: created });
            break;
          }
          case 'DELETE_EXPENSE': {
            await financeApi.deleteExpense(action.payload);
            dispatch(action);
            break;
          }
          case 'IMPORT_EXPENSES': {
            const bodies = action.payload.map(({ id: _id, ...e }) => e);
            const created = await financeApi.importExpenses(bodies);
            dispatch({ type: 'IMPORT_EXPENSES', payload: created });
            break;
          }
          case 'ADD_DEBT': {
            const { id: _id, paid: _paid, ...body } = action.payload;
            const created = await financeApi.createDebt(body);
            dispatch({ type: 'ADD_DEBT', payload: created });
            break;
          }
          case 'DELETE_DEBT': {
            await financeApi.deleteDebt(action.payload);
            dispatch(action);
            break;
          }
          case 'TOGGLE_DEBT_PAID': {
            const updated = await financeApi.toggleDebtPaid(action.payload);
            dispatch({ type: 'UPDATE_DEBT', payload: updated });
            break;
          }
          default:
            dispatch(action);
        }
      } catch (err) {
        console.error(err);
        await loadFromServer();
      } finally {
        syncing.current = false;
      }
    },
    [user, loadFromServer]
  );

  const wrappedDispatch = useCallback(
    (action: Action) => {
      if (!user) {
        dispatch(action);
        return;
      }
      if (action.type === 'LOAD_STATE' || action.type === 'UPDATE_DEBT') {
        dispatch(action);
        return;
      }
      void syncDispatch(action);
    },
    [user, syncDispatch]
  );

  return (
    <FinanceContext.Provider value={{ state, loading, dispatch: wrappedDispatch }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
