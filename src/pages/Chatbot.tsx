import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { getChatbotResponse, getDictionary } from '../i18n';
import { convertAmount, formatCurrency, calculateMonthlyPayment, calculateTotalInterest } from '../utils/currency';
import type { ChatMessage } from '../types/finance';

export default function Chatbot() {
  const { state } = useFinance();
  const { locale, t } = useLanguage();
  const { expenses, debts, currency } = state;

  const initialMessage = useMemo(
    () => ({
      id: '0',
      role: 'assistant' as const,
      content: t('chatbot.initialMessage'),
      timestamp: new Date().toISOString(),
    }),
    [t]
  );

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestions = getDictionary(locale).chatbot.suggestions;

  useEffect(() => {
    setMessages([initialMessage]);
  }, [locale, initialMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getContext = () => {
    const totalExpenses = expenses.reduce((sum, e) => sum + convertAmount(e.amount, e.currency, currency), 0);
    const activeDebts = debts.filter((d) => !d.paid);
    const totalDebt = activeDebts.reduce((sum, d) => sum + convertAmount(d.principal, d.currency, currency), 0);
    const totalMonthly = activeDebts.reduce(
      (sum, d) => sum + convertAmount(calculateMonthlyPayment(d.principal, d.interestRate, d.months), d.currency, currency),
      0
    );
    const totalInterest = activeDebts.reduce(
      (sum, d) => sum + convertAmount(calculateTotalInterest(d.principal, d.interestRate, d.months), d.currency, currency),
      0
    );

    return t('chatbot.contextSnapshot', {
      currency,
      totalExpenses: formatCurrency(totalExpenses, currency),
      debtCount: activeDebts.length,
      totalDebt: formatCurrency(totalDebt, currency),
      monthly: formatCurrency(totalMonthly, currency),
      interest: formatCurrency(totalInterest, currency),
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const response = getChatbotResponse(locale, text, getContext());
    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: t('chatbot.cleared'),
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <section className="py-10 px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-heading flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                {t('chatbot.title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 ml-12">{t('chatbot.subtitleLong')}</p>
            </div>
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('chatbot.clear')}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm"
          >
            <div className="h-[480px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        msg.role === 'assistant'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'assistant'
                          ? 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                          : 'bg-emerald-500 text-white rounded-tr-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 p-4">
              <div className="flex gap-2 mb-3 flex-wrap">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chatbot.placeholder')}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                  aria-label={t('chatbot.send')}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
