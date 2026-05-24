import React, { useRef, useState } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { parseCSVToExpenses } from '../utils/excelImport';
import { toast } from 'react-toastify';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ImportExcelModal({ open, onClose }: Props) {
  const { dispatch } = useFinance();
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [parsedCount, setParsedCount] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const expenses = parseCSVToExpenses(text);
      setParsedCount(expenses.length);
      setPreview(text.split('\n').slice(0, 4).join('\n'));
      if (expenses.length > 0) {
        dispatch({ type: 'IMPORT_EXPENSES', payload: expenses });
        toast.success(t('modal.importSuccess', { count: expenses.length }));
        onClose();
      } else {
        toast.error(t('modal.importError'));
      }
    };
    reader.readAsText(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">{t('modal.importCsv')}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragging ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300'
              }`}
            >
              <Upload className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('modal.importDrag')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('modal.importOr')}</p>
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={onFileChange} />
            </div>

            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('modal.importFormat')}</p>
              </div>
              <code className="text-xs text-slate-500 dark:text-slate-400 block leading-relaxed">
                description,amount,category,date,currency<br />
                Lunch,25000,Food,2025-01-10,COP
              </code>
            </div>

            {parsedCount > 0 && (
              <div className="mt-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t('modal.importSuccess', { count: parsedCount })}</span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
