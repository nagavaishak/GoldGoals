'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreateGoalRequest } from '@/types/goal';

const ease = [0.16, 1, 0.3, 1] as const;

interface CreateGoalModalProps {
  onClose: () => void;
  onGoalCreated?: (goal: any) => void;
  goldPricePerGram?: number;
}

export default function CreateGoalModal({
  onClose,
  onGoalCreated,
  goldPricePerGram = 65,
}: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    target: '',
    deadline: '',
    autoSave: false,
    frequency: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly',
    amount: '',
    visibility: 'public' as 'public' | 'private',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: CreateGoalRequest = {
        title: formData.title,
        userId: formData.title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        target: parseFloat(formData.target),
        deadline: formData.deadline,
        autoSave: formData.autoSave,
        frequency: formData.autoSave ? formData.frequency : undefined,
        amount: formData.autoSave ? parseFloat(formData.amount) : undefined,
        visibility: formData.visibility,
      };
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to create goal');
      onGoalCreated?.(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.97 }}
        transition={{ duration: 0.5, ease }}
        className="bg-[#0f0f0f] border border-white/[0.09] max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-[#0f0f0f] border-b border-white/[0.06] px-8 py-7 flex items-start justify-between z-10">
          <div>
            <p className="text-[#C9A84C] text-[10px] tracking-[0.4em] mb-2 font-mono">NEW COMMITMENT</p>
            <h2 className="text-4xl text-white font-bebas leading-none">
              CREATE YOUR<br />GOAL
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white/55 transition-colors text-2xl leading-none mt-1.5"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
          {error && (
            <p className="text-red-400/60 text-[10px] tracking-[0.1em] border border-red-400/15 p-3 font-mono">
              {error}
            </p>
          )}

          {/* Title */}
          <div className="border-b border-white/10 pb-1 focus-within:border-[#C9A84C]/40 transition-colors">
            <label className="block text-[9px] text-white/25 tracking-[0.35em] mb-3 font-mono">
              GOAL TITLE
            </label>
            <input
              type="text"
              placeholder="Save for Japan trip"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-transparent text-white text-3xl font-bebas outline-none placeholder:text-white/10"
              required
            />
          </div>

          {/* Target */}
          <div className="border-b border-white/10 pb-1 focus-within:border-[#C9A84C]/40 transition-colors">
            <label className="block text-[9px] text-white/25 tracking-[0.35em] mb-3 font-mono">
              TARGET (GRAMS OF GOLD)
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="10"
              value={formData.target}
              onChange={e => setFormData({ ...formData, target: e.target.value })}
              className="w-full bg-transparent text-white text-3xl font-bebas outline-none placeholder:text-white/10"
              required
            />
            {formData.target && (
              <p className="text-white/20 text-[9px] mt-2 font-mono">
                ≈ ${((parseFloat(formData.target) || 0) * goldPricePerGram).toFixed(2)} USD at current price
              </p>
            )}
          </div>

          {/* Deadline */}
          <div className="border-b border-white/10 pb-1 focus-within:border-[#C9A84C]/40 transition-colors">
            <label className="block text-[9px] text-white/25 tracking-[0.35em] mb-3 font-mono">
              DEADLINE
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full bg-transparent text-white text-2xl font-bebas outline-none"
              style={{ colorScheme: 'dark' }}
              required
            />
          </div>

          {/* Auto-save toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-[11px] tracking-[0.2em] font-mono">AUTO-SAVE</p>
              <p className="text-white/20 text-[10px] mt-0.5 font-syne">
                Schedule deposits via GRAIL
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, autoSave: !formData.autoSave })}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                formData.autoSave ? 'bg-[#C9A84C]' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                  formData.autoSave ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {formData.autoSave && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.35, ease }}
              className="space-y-6 pl-4 border-l border-[#C9A84C]/20"
            >
              <div className="border-b border-white/10 pb-1 focus-within:border-[#C9A84C]/40 transition-colors">
                <label className="block text-[9px] text-white/25 tracking-[0.35em] mb-3 font-mono">
                  FREQUENCY
                </label>
                <select
                  value={formData.frequency}
                  onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full bg-transparent text-white text-xl font-bebas outline-none"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="daily">DAILY</option>
                  <option value="weekly">WEEKLY</option>
                  <option value="biweekly">BI-WEEKLY</option>
                  <option value="monthly">MONTHLY</option>
                </select>
              </div>
              <div className="border-b border-white/10 pb-1 focus-within:border-[#C9A84C]/40 transition-colors">
                <label className="block text-[9px] text-white/25 tracking-[0.35em] mb-3 font-mono">
                  AMOUNT PER DEPOSIT (G)
                </label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.5"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-transparent text-white text-2xl font-bebas outline-none placeholder:text-white/10"
                />
              </div>
            </motion.div>
          )}

          {/* Visibility */}
          <div>
            <p className="text-[9px] text-white/25 tracking-[0.35em] mb-4 font-mono">VISIBILITY</p>
            <div className="flex gap-3">
              {(['public', 'private'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: v })}
                  className={`flex-1 py-3 text-[11px] tracking-[0.2em] font-bebas border transition-colors duration-200 ${
                    formData.visibility === v
                      ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/[0.05]'
                      : 'border-white/[0.09] text-white/30 hover:border-white/20'
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-white/[0.09] text-white/30 text-[11px] tracking-[0.2em] font-bebas hover:border-white/20 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-[#C9A84C] text-black text-[11px] tracking-[0.2em] font-bebas hover:bg-[#E8C547] transition-colors disabled:opacity-40 btn-shimmer"
            >
              {loading ? 'CREATING...' : 'CREATE GOAL'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
