import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useFinance } from '../context/FinanceContext';
import { convertAmount, formatCurrency, calculateMonthlyPayment, calculateTotalInterest } from '../utils/currency';
import type { ChatMessage } from '../types/finance';

const FINANCE_RESPONSES: Record<string, string> = {
  default: "I'm your AI Finance Advisor. Ask me about budgeting, debt management, savings strategies, or anything about your finances!",
  greeting: "Hello! I'm Fintrack's AI Finance Advisor. I can help you analyze your expenses, plan debt payoff strategies, and give personalized financial advice. What would you like to know?",
  budget: "A solid budget follows the 50/30/20 rule: 50% for needs (housing, food, transport), 30% for wants (entertainment, dining out), and 20% for savings and debt repayment. Based on your expenses, I recommend reviewing your top spending categories first.",
  debt: "For debt payoff, consider two strategies: **Avalanche** (pay highest interest first — saves the most money) or **Snowball** (pay smallest balance first — builds momentum). With your current debts, the avalanche method would save you the most in interest.",
  savings: "A good savings target is 3-6 months of expenses as an emergency fund. After that, consider investing in index funds or a retirement account. Even saving 10% of your income consistently can build significant wealth over time.",
  invest: "For beginners, low-cost index funds (like S&P 500 ETFs) are a great starting point. In Colombia, you can also consider CDTs (Certificados de Depósito a Término) for safe, fixed returns. Diversification is key — don't put all your eggs in one basket.",
  inflation: "Inflation in Colombia has been significant. To protect your money: invest in assets that outpace inflation (stocks, real estate), consider USD-denominated savings for stability, and avoid keeping large amounts in low-interest savings accounts.",
  emergency: "An emergency fund should cover 3-6 months of essential expenses. Keep it in a liquid, accessible account — not invested in volatile assets. This protects you from unexpected job loss, medical bills, or major repairs.",
  credit: "To improve your credit score: pay bills on time (most important factor), keep credit utilization below 30%, don't close old accounts, and limit new credit applications. In Colombia, check your Datacrédito or TransUnion report regularly.",
  retire: "Start retirement planning early — compound interest is your best friend. In Colombia, contribute to your AFP (pension fund) and consider additional voluntary pension contributions for tax benefits. The earlier you start, the less you need to save monthly.",
  cop: "The COP/USD exchange rate fluctuates based on oil prices, political stability, and global markets. Diversifying savings between COP and USD can hedge against currency risk. Currently, 1 USD ≈ 4,150 COP.",
  expense: "Looking at your expense data, I recommend: 1) Identify your top 3 spending categories, 2) Set monthly limits for discretionary spending, 3) Automate savings before spending. Small reductions in daily habits compound significantly over time.",
};

function generateResponse(message: string, context: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('hola') || lower.includes('hello') || lower.includes('hi')) return FINANCE_RESPONSES.greeting;
  if (lower.includes('budget') || lower.includes('presupuesto') || lower.includes('50/30')) return FINANCE_RESPONSES.budget;
  if (lower.includes('debt') || lower.includes('deuda') || lower.includes('loan') || lower.includes('préstamo')) return FINANCE_RESPONSES.debt + '\n\n' + context;
  if (lower.includes('sav') || lower.includes('ahorro') || lower.includes('emergency') || lower.includes('emergencia')) return FINANCE_RESPONSES.savings;
  if (lower.includes('invest') || lower.includes('invert') || lower.includes('stock') || lower.includes('accion')) return FINANCE_RESPONSES.invest;
  if (lower.includes('inflation') || lower.includes('inflacion') || lower.includes('inflación')) return FINANCE_RESPONSES.inflation;
  if (lower.includes('emergency fund') || lower.includes('fondo de emergencia')) return FINANCE_RESPONSES.emergency;
  if (lower.includes('credit') || lower.includes('crédito') || lower.includes('score')) return FINANCE_RESPONSES.credit;
  if (lower.includes('retire') || lower.includes('pension') || lower.includes('jubilacion') || lower.includes('jubilación')) return FINANCE_RESPONSES.retire;
  if (lower.includes('cop') || lower.includes('usd') || lower.includes('dollar') || lower.includes('dolar') || lower.includes('exchange')) return FINANCE_RESPONSES.cop;
  if (lower.includes('expense') || lower.includes('gasto') || lower.includes('spend')) return FINANCE_RESPONSES.expense + '\n\n' + context;
  return FINANCE_RESPONSES.default;
}

const SUGGESTIONS = [
  'How should I budget my expenses?',
  'What is the best debt payoff strategy?',
  'How much should I save each month?',
  'How do I protect savings from inflation?',
  'Explain COP vs USD savings',
];

export default function Chatbot() {
  const { state } = useFinance();
  const { expenses, debts, currency } = state;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! I'm your AI Finance Advisor. I can analyze your financial data and provide personalized advice. Ask me anything about budgeting, debt management, savings, or investments!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getContext = () => {
    const totalExpenses = expenses.reduce((sum, e) => sum + convertAmount(e.amount, e.currency, currency), 0);
    const activeDebts = debts.filter(d => !d.paid);
    const totalDebt = activeDebts.reduce((sum, d) => sum + convertAmount(d.principal, d.currency, currency), 0);
    const totalMonthly = activeDebts.reduce((sum, d) => sum + convertAmount(calculateMonthlyPayment(d.principal, d.interestRate, d.months), d.currency, currency), 0);
    const totalInterest = activeDebts.reduce((sum, d) => sum + convertAmount(calculateTotalInterest(d.principal, d.interestRate, d.months), d.currency, currency), 0);

    return `📊 Your current financial snapshot (${currency}):\n• Total expenses: ${formatCurrency(totalExpenses, currency)}\n• Active debts: ${activeDebts.length} (${formatCurrency(totalDebt, currency)} total)\n• Monthly debt payments: ${formatCurrency(totalMonthly, currency)}\n• Total interest to pay: ${formatCurrency(totalInterest, currency)}`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = generateResponse(text, getContext());
    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: "Chat cleared. How can I help you with your finances today?",
      timestamp: new Date().toISOString(),
    }]);
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
                AI Finance Advisor
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 ml-12">Personalized financial guidance powered by your data</p>
            </div>
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Clear
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
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.role === 'assistant'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'assistant'
                        ? 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                        : 'bg-emerald-500 text-white rounded-tr-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map(i => (
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
                {SUGGESTIONS.map(s => (
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
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about budgeting, debts, savings..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                  aria-label="Send message"
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