import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Shield, BarChart3, CreditCard } from 'lucide-react';

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-xl font-bold text-slate-800 dark:text-white">Fintrack</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Crear cuenta
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white font-heading leading-tight mb-6">
              Controla tus finanzas en un solo lugar
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Gastos, deudas, gráficos y consejos con IA. Tus datos se guardan de forma segura en la nube con tu cuenta personal.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid gap-4"
          >
            {[
              { icon: BarChart3, title: 'Dashboard completo', desc: 'Resumen de gastos, deudas y pagos mensuales.' },
              { icon: CreditCard, title: 'Gestión de deudas', desc: 'Calcula cuotas e intereses automáticamente.' },
              { icon: Shield, title: 'Datos en PostgreSQL', desc: 'Cada usuario ve solo su información, guardada en Render.' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="flex gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
