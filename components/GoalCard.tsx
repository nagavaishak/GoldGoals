'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useInView } from 'framer-motion';
import { Goal } from '@/types/goal';

const ease = [0.16, 1, 0.3, 1] as const;

interface GoalCardProps {
  goal: Goal;
  onGiftSent?: (goalId: number, amount: number) => void;
  goldPricePerGram?: number;
}

export default function GoalCard({ goal, onGiftSent, goldPricePerGram = 65 }: GoalCardProps) {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = Math.min((goal.current / goal.target) * 100, 100);
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86_400_000);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  // 3D tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-70, 70], [4, -4]);
  const rotY = useTransform(mx, [-70, 70], [-4, 4]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  }
  function onMouseLeave() { mx.set(0); my.set(0); }

  const handleGiftGold = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: 'demo_user',
          goalId: goal.id,
          amount: parseFloat(giftAmount),
          message: giftMessage,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to send gift');
      onGiftSent?.(goal.id, parseFloat(giftAmount));
      setGiftAmount('');
      setGiftMessage('');
      setShowGiftModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        ref={ref}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="group relative bg-[#111111] border border-white/[0.07] hover:border-[#C9A84C]/30 transition-colors duration-500 flex flex-col h-full overflow-hidden"
      >
        {/* Subtle hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,168,76,0.05), transparent 60%)' }}
        />

        <div className="relative p-6 flex flex-col flex-1">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <img
                src={goal.avatar}
                alt={goal.creator}
                className="w-7 h-7 rounded-full grayscale opacity-60"
              />
              <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-mono">
                {goal.creator}
              </span>
            </div>
            {goal.completed ? (
              <span className="text-[9px] tracking-[0.2em] text-emerald-400/80 border border-emerald-400/20 px-2 py-0.5 font-mono">
                COMPLETED
              </span>
            ) : daysLeft > 0 ? (
              <span className="text-white/20 text-[9px] tracking-[0.15em] font-mono">
                {daysLeft}d left
              </span>
            ) : (
              <span className="text-red-400/50 text-[9px] tracking-[0.15em] font-mono">
                OVERDUE
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[1.6rem] text-white font-bebas leading-tight mb-6 flex-1">
            {goal.title}
          </h3>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'SAVED', value: `${goal.current}g` },
              { label: 'TARGET', value: `${goal.target}g` },
              { label: 'USD', value: `$${(goal.current * goldPricePerGram).toFixed(0)}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-white/20 text-[8px] tracking-[0.2em] mb-1 font-mono">{label}</div>
                <div className="text-white/70 text-base font-bebas leading-none">{value}</div>
              </div>
            ))}
          </div>

          {/* Supporters */}
          <div className="text-white/20 text-[9px] tracking-[0.2em] mb-5 font-mono">
            {goal.supporters} SUPPORTERS
          </div>

          {/* Gift button */}
          {!goal.completed && (
            <button
              onClick={() => setShowGiftModal(true)}
              className="btn-shimmer w-full py-3 border border-white/[0.09] text-[#C9A84C] text-[11px] tracking-[0.3em] font-bebas hover:border-[#C9A84C]/35 hover:bg-[#C9A84C]/[0.04] transition-all duration-300"
            >
              GIFT GOLD
            </button>
          )}
        </div>

        {/* Gold progress line — bottom edge of card */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/[0.04]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E8C547]"
            initial={{ width: '0%' }}
            animate={inView ? { width: `${progress}%` } : {}}
            transition={{ duration: 1.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>

      {/* Gift Modal */}
      {showGiftModal && (
        <div
          className="fixed inset-0 bg-black/92 flex items-center justify-center z-50 p-4"
          onClick={() => setShowGiftModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease }}
            className="bg-[#0f0f0f] border border-white/[0.09] max-w-md w-full p-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[#C9A84C] text-[10px] tracking-[0.35em] mb-2 font-mono">GIFT GOLD</p>
                <h3 className="text-3xl text-white font-bebas leading-tight">{goal.title}</h3>
                <p className="text-white/25 text-[10px] mt-1 font-mono tracking-[0.1em]">
                  {goal.current}g / {goal.target}g — {progress.toFixed(0)}%
                </p>
              </div>
              <button
                onClick={() => setShowGiftModal(false)}
                className="text-white/20 hover:text-white/50 transition-colors text-2xl leading-none mt-1"
              >
                ×
              </button>
            </div>

            {error && (
              <p className="text-red-400/60 text-[10px] tracking-[0.1em] border border-red-400/15 p-3 mb-6 font-mono">
                {error}
              </p>
            )}

            <form onSubmit={handleGiftGold} className="space-y-7">
              {/* Amount */}
              <div className="group/input border-b border-white/10 pb-1 focus-within:border-[#C9A84C]/40 transition-colors">
                <label className="block text-[9px] text-white/25 tracking-[0.35em] mb-3 font-mono">
                  AMOUNT (GRAMS)
                </label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.5"
                  value={giftAmount}
                  onChange={e => setGiftAmount(e.target.value)}
                  className="w-full bg-transparent text-white text-3xl font-bebas outline-none placeholder:text-white/10"
                  required
                  min="0.001"
                />
                {giftAmount && parseFloat(giftAmount) > 0 && (
                  <p className="text-white/20 text-[9px] mt-2 font-mono">
                    ≈ ${(parseFloat(giftAmount) * goldPricePerGram).toFixed(2)} USD
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="border-b border-white/10 pb-1 focus-within:border-[#C9A84C]/40 transition-colors">
                <label className="block text-[9px] text-white/25 tracking-[0.35em] mb-3 font-mono">
                  MESSAGE (OPTIONAL)
                </label>
                <textarea
                  placeholder="Keep going..."
                  value={giftMessage}
                  onChange={e => setGiftMessage(e.target.value)}
                  className="w-full bg-transparent text-white/60 text-sm outline-none placeholder:text-white/10 resize-none font-syne"
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGiftModal(false)}
                  className="flex-1 py-3.5 border border-white/[0.09] text-white/30 text-[11px] tracking-[0.2em] font-bebas hover:border-white/20 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-[#C9A84C] text-black text-[11px] tracking-[0.2em] font-bebas hover:bg-[#E8C547] transition-colors disabled:opacity-40 btn-shimmer"
                >
                  {loading ? 'SENDING...' : 'SEND GIFT'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
