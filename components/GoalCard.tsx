'use client';

/**
 * GoalCard — Gamified progression card
 *
 * Every animation in this component is intentional:
 *   Entry slide-up      → "This goal is alive, not static"
 *   Gram counter        → "Real progress, not just a number"
 *   Spring progress bar → "Momentum has weight and physics"
 *   Milestone flashes   → "You crossed a threshold that matters"
 *   Cursor pulse speed  → "Tension builds as you approach a milestone"
 *   Deadline red shift  → "Time is real — not decorative"
 *   Momentum surge      → "A supporter's gift has physical energy"
 *   State tracker       → "You are levelling up a system, not filling a bar"
 */

import { useState, useRef, useEffect, Fragment } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  useMotionValueEvent,
  animate,
  AnimatePresence,
} from 'framer-motion';
import { Goal } from '@/types/goal';

// ── Types & constants ─────────────────────────────────────────────

type GoalState = 'SET' | 'STACK' | 'BOOST' | 'UNLOCK' | 'COMPLETE';
const STATES: GoalState[] = ['SET', 'STACK', 'BOOST', 'UNLOCK', 'COMPLETE'];

/** Thresholds determine which state the goal is in */
function deriveState(pct: number): GoalState {
  if (pct >= 100) return 'COMPLETE';
  if (pct >= 75)  return 'UNLOCK';
  if (pct >= 50)  return 'BOOST';
  if (pct >= 10)  return 'STACK';
  return 'SET';
}

const MILESTONES = [
  { pct: 25, label: 'CONSISTENCY' },
  { pct: 50, label: 'HALFWAY'     },
  { pct: 75, label: 'FINISH STRONG' },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;

// ── State Tracker ─────────────────────────────────────────────────
/**
 * Five-node horizontal track showing the goal's current level.
 * Active node breathes gold — communicates "you are here, in a live system."
 * Past nodes are dim gold — communicates "you've already earned this."
 * Future nodes are invisible — communicates "this is locked, not just empty."
 */
function StateTracker({ current }: { current: GoalState }) {
  const idx = STATES.indexOf(current);
  return (
    <div className="flex items-start w-full mb-5">
      {STATES.map((s, i) => {
        const isPast   = i < idx;
        const isActive = i === idx;
        return (
          <Fragment key={s}>
            <div className="flex flex-col items-center gap-1.5 flex-none">
              <motion.div
                animate={{
                  backgroundColor: isActive ? '#C9A84C' : isPast ? 'rgba(201,168,76,0.35)' : 'transparent',
                  borderColor:     isActive ? '#C9A84C' : isPast ? 'rgba(201,168,76,0.3)'  : 'rgba(255,255,255,0.09)',
                  scale: isActive ? 1.35 : 1,
                }}
                transition={{ duration: 0.55, ease }}
                className={`w-1.5 h-1.5 rounded-full border ${isActive ? 'state-dot-active' : ''}`}
              />
              <span className={`text-[6.5px] tracking-[0.18em] font-mono transition-colors duration-500 ${
                isActive ? 'text-[#C9A84C]' : isPast ? 'text-white/20' : 'text-white/[0.07]'
              }`}>
                {s}
              </span>
            </div>
            {i < STATES.length - 1 && (
              <motion.div
                animate={{ backgroundColor: isPast ? 'rgba(201,168,76,0.22)' : 'rgba(255,255,255,0.05)' }}
                transition={{ duration: 0.5 }}
                className="flex-1 h-px mt-[0.4rem] mx-1.5"
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

// ── Gamified Progress Bar ─────────────────────────────────────────
/**
 * The heartbeat of the card.
 *
 * - Spring fill: progress has physical weight, not instant math
 * - Glowing cursor: the "active front" of your effort
 * - Cursor pulse speed increases near milestones — anticipation mechanic
 * - Milestone ticks light up as you cross them — checkpoint reward
 * - Momentum shimmer: a sweep of light when a supporter gifts — social energy made visible
 * - Deadline urgency: gradient shifts warm/red as days drop — time becomes tangible
 */
interface ProgressBarProps {
  progress:  number;
  inView:    boolean;
  momentum:  boolean;
  daysLeft:  number;
}

function GamifiedProgressBar({ progress, inView, momentum, daysLeft }: ProgressBarProps) {
  const fillMV     = useMotionValue(0);
  const springFill = useSpring(fillMV, { stiffness: 38, damping: 22 });
  const fillWidth  = useTransform(springFill, v => `${Math.max(0, Math.min(100, v))}%`);

  // Dramatic delayed reveal on first viewport entry
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (inView && !started) {
      const t = setTimeout(() => { setStarted(true); fillMV.set(progress); }, 380);
      return () => clearTimeout(t);
    }
  }, [inView]); // eslint-disable-line

  // Instant update for subsequent changes (gifts, etc.)
  useEffect(() => {
    if (started) fillMV.set(progress);
  }, [progress, started]); // eslint-disable-line

  const isUrgent   = daysLeft > 0 && daysLeft <= 7;
  const isCritical = daysLeft > 0 && daysLeft <= 2;

  // Near milestone → cursor pulses faster (tension mechanic)
  const nearMilestone = MILESTONES.some(m => {
    const dist = m.pct - progress;
    return dist > 0 && dist <= 4;
  });

  // Gradient shifts warm → red under deadline pressure (urgency mechanic)
  const fillGradient = isCritical
    ? 'linear-gradient(90deg, #C9A84C 0%, #ff4d2e 100%)'
    : isUrgent
    ? 'linear-gradient(90deg, #C9A84C 0%, #ff8c42 100%)'
    : 'linear-gradient(90deg, #C9A84C 0%, #E8C547 100%)';

  return (
    <div className="mb-1">
      {/* Track */}
      <div className="relative h-[5px] bg-white/[0.06] overflow-visible">

        {/* Gold fill — uses spring so momentum surges feel physical */}
        <motion.div
          style={{ width: fillWidth }}
          className="absolute inset-y-0 left-0 overflow-hidden"
        >
          <div className="w-full h-full" style={{ background: fillGradient }} />
          {/* Momentum shimmer: sweeps the fill to show social energy flowing */}
          {momentum && (
            <div
              className="absolute inset-0 animate-progress-shimmer pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)' }}
            />
          )}
        </motion.div>

        {/* Active cursor dot — pulses faster near milestones to create tension */}
        <motion.div
          style={{ left: fillWidth }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
        >
          <div className={`w-2.5 h-2.5 rounded-full bg-[#E8C547] border border-[#C9A84C]/80 ${
            nearMilestone ? 'cursor-pulse-fast' : 'cursor-pulse-slow'
          }`}
            style={{ boxShadow: `0 0 ${momentum ? '14px' : '6px'} rgba(201,168,76,0.7)` }}
          />
        </motion.div>

        {/* Milestone tick marks — light up permanently when crossed */}
        {MILESTONES.map(({ pct }) => {
          const reached = progress >= pct;
          return (
            <motion.div
              key={pct}
              className="absolute top-0 bottom-0 w-px pointer-events-none"
              style={{ left: `${pct}%` }}
              animate={{
                backgroundColor: reached ? '#C9A84C' : 'rgba(255,255,255,0.12)',
                scaleY:           reached ? 2 : 1,
                boxShadow:        reached ? '0 0 5px rgba(201,168,76,0.6)' : 'none',
              }}
              transition={{ duration: 0.5, ease }}
            />
          );
        })}
      </div>

      {/* Milestone labels row */}
      <div className="relative h-5 mt-1.5">
        {MILESTONES.map(({ pct, label }) => {
          const reached = progress >= pct;
          return (
            <motion.span
              key={pct}
              className="absolute text-[6.5px] tracking-[0.15em] font-mono whitespace-nowrap"
              style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
              animate={{ color: reached ? 'rgba(201,168,76,0.7)' : 'rgba(255,255,255,0.13)' }}
              transition={{ duration: 0.4 }}
            >
              {label}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

// ── Main GoalCard ─────────────────────────────────────────────────

interface GoalCardProps {
  goal:           Goal;
  onGiftSent?:    (goalId: number, amount: number) => void;
  goldPricePerGram?: number;
}

export default function GoalCard({ goal, onGiftSent, goldPricePerGram = 65 }: GoalCardProps) {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftAmount,    setGiftAmount]    = useState('');
  const [giftMessage,   setGiftMessage]   = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [giftError,     setGiftError]     = useState<string | null>(null);

  // Local copy so gifting reflects immediately without waiting for parent refetch
  const [live, setLive] = useState(goal);
  useEffect(() => { setLive(goal); }, [goal]);

  const progress    = Math.min((live.current / live.target) * 100, 100);
  const state       = deriveState(progress);
  const daysLeft    = Math.ceil((new Date(live.deadline).getTime() - Date.now()) / 86_400_000);
  const isUrgent    = daysLeft > 0 && daysLeft <= 7;
  const isCritical  = daysLeft > 0 && daysLeft <= 2;

  // Viewport detection for entry animations
  const cardRef = useRef<HTMLDivElement>(null);
  const inView  = useInView(cardRef, { once: true, margin: '-5%' });

  // ── Gram counter (counts up on entry, surges on gift) ──────────
  // Emotion: "this is real weight accumulating, not just a number"
  const gramsMV   = useMotionValue(0);
  const [gramsDisplay, setGramsDisplay] = useState('0.00');
  useMotionValueEvent(gramsMV, 'change', v => setGramsDisplay(v.toFixed(2)));

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => animate(gramsMV, live.current, { duration: 1.6, ease: 'easeOut' }), 300);
      return () => clearTimeout(t);
    }
  }, [inView]); // eslint-disable-line

  // ── Momentum state (triggered by a gift) ──────────────────────
  // Emotion: "a supporter's action has physical presence"
  const [momentum, setMomentum] = useState(false);

  // ── Milestone unlock notification ─────────────────────────────
  // Emotion: "I just crossed a checkpoint — that matters"
  const prevPctRef   = useRef(progress);
  const [unlocked, setUnlocked] = useState<string | null>(null);

  useEffect(() => {
    const prev = prevPctRef.current;
    const hit  = MILESTONES.find(m => prev < m.pct && progress >= m.pct);
    if (hit) {
      setUnlocked(hit.label);
      const t = setTimeout(() => setUnlocked(null), 2600);
      return () => clearTimeout(t);
    }
    prevPctRef.current = progress;
  }, [progress]);

  // ── Next unlock hint ───────────────────────────────────────────
  const nextM = MILESTONES.find(m => m.pct > progress);
  const nextUnlockGrams = nextM
    ? ((nextM.pct / 100) * live.target - live.current).toFixed(2)
    : null;

  // ── Gift handler ───────────────────────────────────────────────
  async function handleGiftGold(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setGiftError(null);
    try {
      const resp   = await fetch('/api/gift', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: 'demo_user',
          goalId:     goal.id,
          amount:     parseFloat(giftAmount),
          message:    giftMessage,
        }),
      });
      const result = await resp.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to send gift');

      const gifted  = parseFloat(giftAmount);
      const newLive = { ...live, current: live.current + gifted, completed: live.current + gifted >= live.target };

      // Optimistic UI — update locally immediately
      setLive(newLive);

      // Gram counter surges to new value (fast spring)
      animate(gramsMV, newLive.current, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });

      // Momentum burst: border glows, shimmer sweeps the bar
      setMomentum(true);
      setTimeout(() => setMomentum(false), 2800);

      onGiftSent?.(goal.id, gifted);
      setGiftAmount('');
      setGiftMessage('');
      setShowGiftModal(false);
    } catch (err) {
      setGiftError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Border class driven by state ──────────────────────────────
  const borderClass = momentum
    ? 'border-[#C9A84C]/60'
    : isCritical
    ? 'border-red-500/25'
    : isUrgent
    ? 'border-amber-500/20'
    : live.completed
    ? 'border-emerald-500/20'
    : 'border-white/[0.07]';

  return (
    <>
      <motion.div
        ref={cardRef}
        // Entry: "This goal woke up and is ready to be engaged with"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease }}
        // Momentum glow: surrounds card with gold energy on gift
        style={{
          boxShadow: momentum
            ? '0 0 0 1px rgba(201,168,76,0.5), 0 0 50px rgba(201,168,76,0.08), inset 0 0 30px rgba(201,168,76,0.04)'
            : undefined,
          transition: 'box-shadow 0.4s ease',
        }}
        className={`relative bg-[#111111] border transition-colors duration-500 flex flex-col overflow-hidden ${borderClass}`}
      >
        {/* Momentum background glow */}
        <AnimatePresence>
          {momentum && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 110%, rgba(201,168,76,0.07), transparent)' }}
            />
          )}
        </AnimatePresence>

        {/* Milestone unlock notification — top-right flash */}
        <AnimatePresence>
          {unlocked && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0,  scale: 1   }}
              exit={{    opacity: 0, y: -8, scale: 0.9 }}
              transition={{ duration: 0.35, ease }}
              className="absolute top-3 right-3 z-20 bg-[#C9A84C] text-black px-2.5 py-1 pointer-events-none"
            >
              <span className="text-[8px] tracking-[0.25em] font-mono font-bold leading-none">
                {unlocked} UNLOCKED
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative p-5 flex flex-col flex-1">

          {/* ── State tracker ──────────────────────────────────── */}
          <StateTracker current={state} />

          {/* ── Creator row ────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <img
                src={live.avatar}
                alt={live.creator}
                className="w-5 h-5 rounded-full grayscale opacity-50"
              />
              <span className="text-white/25 text-[9px] tracking-[0.2em] uppercase font-mono">
                {live.creator}
              </span>
            </div>

            {/* Deadline: turns amber → red → pulses on critical */}
            <span
              className={`text-[9px] tracking-[0.18em] font-mono ${
                isCritical ? 'text-red-400 deadline-critical'
                : isUrgent  ? 'text-amber-400/80'
                : live.completed ? 'text-emerald-400/60'
                : 'text-white/18'
              }`}
            >
              {live.completed ? 'COMPLETE' : daysLeft > 0 ? `${daysLeft}D` : 'DUE'}
            </span>
          </div>

          {/* ── Title ──────────────────────────────────────────── */}
          <h3 className="text-[1.55rem] text-white font-bebas leading-tight mb-4">
            {live.title}
          </h3>

          {/* ── Animated gram counter ──────────────────────────── */}
          {/* Emotion: "real weight accumulating, not just pixels moving" */}
          <div className="flex items-baseline justify-between mb-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-[2.2rem] leading-none font-bebas text-[#C9A84C]">
                {gramsDisplay}
              </span>
              <span className="text-[#C9A84C]/45 text-xs font-mono">g</span>
            </div>
            <span className="text-white/18 text-xs font-mono">/ {live.target}g</span>
          </div>

          {/* ── Gamified progress bar ──────────────────────────── */}
          <GamifiedProgressBar
            progress={progress}
            inView={inView}
            momentum={momentum}
            daysLeft={daysLeft}
          />

          {/* ── Stats row ──────────────────────────────────────── */}
          <div className="flex justify-between mt-3 mb-3.5">
            {[
              { v: `${progress.toFixed(0)}%`,                             l: 'COMPLETE' },
              { v: `$${(live.current * goldPricePerGram).toFixed(0)}`,    l: 'USD'      },
              { v: String(live.supporters),                               l: 'BACKERS'  },
            ].map(({ v, l }) => (
              <div key={l}>
                <div className="text-white/65 text-[1.05rem] font-bebas leading-none">{v}</div>
                <div className="text-white/15 text-[7px] tracking-[0.2em] mt-0.5 font-mono">{l}</div>
              </div>
            ))}
          </div>

          {/* ── Next unlock hint ───────────────────────────────── */}
          {/* Emotion: "there is a specific, nearby reward waiting for me" */}
          {nextM && !live.completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex items-center gap-2 mb-3.5 py-2 px-2.5 bg-white/[0.025] border border-white/[0.05]"
            >
              <div className="w-1 h-1 rounded-full bg-[#C9A84C]/40 flex-none" />
              <span className="text-white/22 text-[8.5px] tracking-[0.1em] font-mono">
                {nextUnlockGrams}g to{' '}
                <span className="text-[#C9A84C]/55">{nextM.label}</span>
              </span>
            </motion.div>
          )}

          {/* ── Momentum active banner ─────────────────────────── */}
          {/* Emotion: "someone's action is actively pushing this goal forward" */}
          <AnimatePresence>
            {momentum && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{    opacity: 0, height: 0     }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-3.5"
              >
                <div className="flex items-center gap-2 py-2 px-2.5 border border-[#C9A84C]/20 bg-[#C9A84C]/[0.04]">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 0.45 }}
                    className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-none"
                  />
                  <span className="text-[#C9A84C]/80 text-[8.5px] tracking-[0.3em] font-mono">
                    MOMENTUM ACTIVE
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Action button ──────────────────────────────────── */}
          {/* Tactile press scale + shimmer — emotion: "this action has weight" */}
          {live.completed ? (
            <div className="w-full py-2.5 border border-emerald-400/20 text-emerald-400/60 text-[10px] tracking-[0.3em] font-bebas text-center mt-auto">
              GOAL ACHIEVED ✓
            </div>
          ) : (
            <motion.button
              onClick={() => setShowGiftModal(true)}
              whileTap={{ scale: 0.96 }}
              whileHover={{ borderColor: 'rgba(201,168,76,0.45)' }}
              className="btn-shimmer w-full py-2.5 mt-auto border border-white/[0.09] text-[#C9A84C] text-[10px] tracking-[0.3em] font-bebas transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>GIFT GOLD</span>
              {/* Arrow bobs right — micro-cue that action is available */}
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="text-[#C9A84C]/60"
              >
                →
              </motion.span>
            </motion.button>
          )}
        </div>

        {/* Gold sweep line — bottom edge shows overall progress at a glance */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/[0.04]">
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C547)' }}
            initial={{ width: '0%' }}
            animate={inView ? { width: `${progress}%` } : {}}
            transition={{ duration: 1.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>

      {/* ── Gift Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showGiftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/92 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGiftModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.4, ease }}
              className="bg-[#0d0d0d] border border-white/[0.09] max-w-md w-full p-8"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-[#C9A84C] text-[9px] tracking-[0.4em] mb-2 font-mono">
                    GIFT GOLD
                  </p>
                  <h3 className="text-[1.85rem] text-white font-bebas leading-tight">
                    {live.title}
                  </h3>
                  <p className="text-white/22 text-[9px] mt-1.5 font-mono tracking-[0.08em]">
                    {live.current}g / {live.target}g — {progress.toFixed(0)}% complete
                  </p>
                </div>
                <button
                  onClick={() => setShowGiftModal(false)}
                  className="text-white/20 hover:text-white/50 transition-colors text-2xl leading-none mt-0.5"
                >
                  ×
                </button>
              </div>

              {giftError && (
                <p className="text-red-400/60 text-[9px] tracking-[0.1em] border border-red-400/15 p-3 mb-6 font-mono">
                  {giftError}
                </p>
              )}

              <form onSubmit={handleGiftGold} className="space-y-7">
                {/* Amount */}
                <div className="border-b border-white/10 pb-1 focus-within:border-[#C9A84C]/40 transition-colors duration-300">
                  <label className="block text-[9px] text-white/22 tracking-[0.35em] mb-3 font-mono">
                    AMOUNT (GRAMS)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.5"
                    value={giftAmount}
                    onChange={e => setGiftAmount(e.target.value)}
                    className="w-full bg-transparent text-white text-[2.2rem] font-bebas outline-none placeholder:text-white/10 leading-none"
                    required
                    min="0.001"
                  />
                  {giftAmount && parseFloat(giftAmount) > 0 && (
                    <p className="text-white/18 text-[9px] mt-2 font-mono">
                      ≈ ${(parseFloat(giftAmount) * goldPricePerGram).toFixed(2)} USD
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="border-b border-white/10 pb-1 focus-within:border-[#C9A84C]/40 transition-colors duration-300">
                  <label className="block text-[9px] text-white/22 tracking-[0.35em] mb-3 font-mono">
                    MESSAGE (OPTIONAL)
                  </label>
                  <textarea
                    placeholder="Keep going..."
                    value={giftMessage}
                    onChange={e => setGiftMessage(e.target.value)}
                    className="w-full bg-transparent text-white/60 text-sm outline-none placeholder:text-white/10 resize-none font-syne leading-relaxed"
                    rows={2}
                  />
                </div>

                {/* Preview of impact */}
                {giftAmount && parseFloat(giftAmount) > 0 && (
                  <div className="py-2.5 px-3 bg-white/[0.025] border border-white/[0.05]">
                    <p className="text-white/22 text-[8.5px] font-mono tracking-[0.1em]">
                      After this gift:{' '}
                      <span className="text-[#C9A84C]/70">
                        {(live.current + parseFloat(giftAmount)).toFixed(2)}g /{' '}
                        {(Math.min(((live.current + parseFloat(giftAmount)) / live.target) * 100, 100)).toFixed(0)}%
                      </span>
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGiftModal(false)}
                    className="flex-1 py-3.5 border border-white/[0.09] text-white/28 text-[10px] tracking-[0.2em] font-bebas hover:border-white/18 transition-colors"
                  >
                    CANCEL
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3.5 bg-[#C9A84C] text-black text-[10px] tracking-[0.2em] font-bebas hover:bg-[#E8C547] transition-colors disabled:opacity-40 btn-shimmer"
                  >
                    {submitting ? 'SENDING...' : 'SEND GIFT'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
