import React, { Suspense } from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';

import { AuthProvider } from './src/context/AuthContext';
import { FinanceProvider } from './src/context/FinanceContext';
import ProtectedRoute from './src/components/ProtectedRoute';
import Landing from './src/pages/Landing';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Dashboard from './src/pages/Dashboard';
import Expenses from './src/pages/Expenses';
import Debts from './src/pages/Debts';
import Charts from './src/pages/Charts';
import Chatbot from './src/pages/Chatbot';
import NotFound from './src/pages/NotFound';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FinanceProvider>
        <Theme appearance="inherit" radius="large" scaling="100%">
          <Router>
            <Suspense
              fallback={
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute>
                      <Expenses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/debts"
                  element={
                    <ProtectedRoute>
                      <Debts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/charts"
                  element={
                    <ProtectedRoute>
                      <Charts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chatbot"
                  element={
                    <ProtectedRoute>
                      <Chatbot />
                    </ProtectedRoute>
                  }
                />
                <Route path="/home" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover theme="colored" />
          </Router>
        </Theme>
      </FinanceProvider>
    </AuthProvider>
  );
};

export default App;
