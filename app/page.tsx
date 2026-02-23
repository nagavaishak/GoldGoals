'use client';

import { useState, useEffect, useRef } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import GoalCard from '@/components/GoalCard';
import CreateGoalModal from '@/components/CreateGoalModal';
import { Goal } from '@/types/goal';

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Grain overlay ─────────────────────────────────────────────── */
function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}

/* ── 3D Gold Bar (isometric SVG) ───────────────────────────────── */
function GoldBarSVG({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bt-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8C0" />
          <stop offset="45%" stopColor="#F0CC50" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
        <linearGradient id={`bl-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#7A5414" />
        </linearGradient>
        <linearGradient id={`br-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9B7228" />
          <stop offset="100%" stopColor="#4A2E06" />
        </linearGradient>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="100" cy="145" rx="82" ry="7" fill="rgba(0,0,0,0.4)" />
      {/* Top face */}
      <polygon points="100,12 182,52 100,90 18,50" fill={`url(#bt-${uid})`} />
      {/* Left face */}
      <polygon points="18,50 100,90 100,132 18,92" fill={`url(#bl-${uid})`} />
      {/* Right face */}
      <polygon points="100,90 182,52 182,94 100,132" fill={`url(#br-${uid})`} />
      {/* Raised platform on top */}
      <polygon points="100,24 164,56 100,76 36,46" fill="#F5D76E" opacity="0.35" />
      {/* Top edge specular */}
      <polyline points="18,50 100,12 182,52" stroke="#FFFBD5" strokeWidth="1.5" fill="none" opacity="0.75" strokeLinejoin="round" />
      <line x1="100" y1="12" x2="100" y2="90" stroke="#FFFBD5" strokeWidth="0.8" opacity="0.35" />
      {/* Engraved lines on top face */}
      <line x1="52" y1="44" x2="148" y2="68" stroke="#B8922A" strokeWidth="0.8" opacity="0.55" />
      <line x1="52" y1="51" x2="148" y2="75" stroke="#B8922A" strokeWidth="0.8" opacity="0.55" />
      {/* Brand on front face */}
      <line x1="28" y1="104" x2="90" y2="116" stroke="#F5D76E" strokeWidth="0.7" opacity="0.35" />
      <line x1="28" y1="110" x2="85" y2="121" stroke="#F5D76E" strokeWidth="0.7" opacity="0.35" />
    </svg>
  );
}

/* ── 3D Gold Coin (SVG) ────────────────────────────────────────── */
function GoldCoinSVG({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 110 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`cf-${uid}`} cx="36%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFAD8" />
          <stop offset="25%" stopColor="#F5D76E" />
          <stop offset="70%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#7A5414" />
        </radialGradient>
        <linearGradient id={`cs-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A07830" />
          <stop offset="100%" stopColor="#4A2E06" />
        </linearGradient>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="55" cy="123" rx="42" ry="6" fill="rgba(0,0,0,0.35)" />
      {/* Coin side (thickness) */}
      <path d="M13,62 A42,42 0 1,0 97,62 L97,75 A42,13 0 0,1 13,75 Z" fill={`url(#cs-${uid})`} />
      {/* Coin face */}
      <circle cx="55" cy="55" r="42" fill={`url(#cf-${uid})`} />
      {/* Concentric detail rings */}
      <circle cx="55" cy="55" r="36" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.45" />
      <circle cx="55" cy="55" r="28" fill="none" stroke="#C9A84C" strokeWidth="0.6" opacity="0.3" />
      {/* Center G */}
      <text x="55" y="68" textAnchor="middle" fill="#7A5414" fontSize="30"
        fontFamily="Georgia, serif" fontWeight="bold" opacity="0.7">G</text>
      {/* Specular highlight arc */}
      <path d="M23,32 A42,42 0 0,1 87,32" stroke="#FFFBD5" strokeWidth="2.5"
        fill="none" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Floating 3D Objects (hero background) ─────────────────────── */
function FloatingObjects() {
  const glow = {
    filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8)) drop-shadow(0 0 35px rgba(201,168,76,0.18))',
  };
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Large bar — top right, partially off-screen */}
      <div className="absolute" style={{ top: '-40px', right: '-70px', width: '300px', transform: 'rotate(-18deg)' }}>
        <div className="float-a" style={{ animationDelay: '0s', ...glow }}>
          <GoldBarSVG uid="bar1" />
        </div>
      </div>

      {/* Large coin — bottom left */}
      <div className="absolute hidden sm:block" style={{ bottom: '70px', left: '-55px', width: '240px', transform: 'rotate(14deg)' }}>
        <div className="float-b" style={{ animationDelay: '0.7s', ...glow }}>
          <GoldCoinSVG uid="coin1" />
        </div>
      </div>

      {/* Medium bar — center right */}
      <div className="absolute hidden md:block" style={{ top: '37%', right: '18px', width: '200px', transform: 'rotate(30deg)' }}>
        <div className="float-c" style={{ animationDelay: '1.4s', ...glow }}>
          <GoldBarSVG uid="bar2" />
        </div>
      </div>

      {/* Small coin — top left */}
      <div className="absolute hidden lg:block" style={{ top: '110px', left: '-15px', width: '150px', transform: 'rotate(-7deg)' }}>
        <div className="float-d" style={{ animationDelay: '2.1s', ...glow }}>
          <GoldCoinSVG uid="coin2" />
        </div>
      </div>

      {/* Small bar — bottom right */}
      <div className="absolute hidden sm:block" style={{ bottom: '-25px', right: '155px', width: '175px', transform: 'rotate(-40deg)' }}>
        <div className="float-b" style={{ animationDelay: '0.3s', ...glow }}>
          <GoldBarSVG uid="bar3" />
        </div>
      </div>
    </div>
  );
}

/* ── Nav ───────────────────────────────────────────────────────── */
function Nav({ onCreateGoal }: { onCreateGoal: () => void }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.06] backdrop-blur-xl bg-black/50"
    >
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-[#C9A84C] flex items-center justify-center">
          <span className="text-black font-bold text-xs font-bebas tracking-wider">GG</span>
        </div>
        <span className="text-white/80 tracking-[0.25em] text-sm font-bebas">
          GOLDGOALS
        </span>
      </div>
      <button
        onClick={onCreateGoal}
        className="btn-shimmer px-6 py-2 border border-[#C9A84C]/60 text-[#C9A84C] text-xs tracking-[0.2em] font-bebas hover:bg-[#C9A84C] hover:text-black transition-colors duration-300"
      >
        CREATE GOAL
      </button>
    </motion.nav>
  );
}

/* ── Hero ──────────────────────────────────────────────────────── */
function HeroSection({
  goals,
  loading,
  goldPricePerGram,
  onCreateGoal,
}: {
  goals: Goal[];
  loading: boolean;
  goldPricePerGram: number;
  onCreateGoal: () => void;
}) {
  const totalGold = goals.reduce((s, g) => s + g.current, 0);
  const activeCount = goals.filter(g => !g.completed).length;

  const words: { text: string; gold: boolean }[] = [
    { text: 'SAVE.', gold: false },
    { text: 'COMMIT.', gold: true },
    { text: 'WIN.', gold: false },
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
      {/* Animated gold blob */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="gold-blob" />
      </div>

      {/* Floating 3D gold objects */}
      <FloatingObjects />

      {/* Giant ghost number */}
      {!loading && (
        <div
          className="absolute right-[-2vw] top-1/2 -translate-y-1/2 text-[22vw] leading-none select-none pointer-events-none text-white/[0.025] font-bebas"
        >
          {totalGold.toFixed(0)}g
        </div>
      )}

      <div className="relative z-10 px-6 md:px-16 max-w-[1400px] mx-auto w-full">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="text-[#C9A84C] tracking-[0.45em] text-[10px] mb-10 font-mono"
        >
          SOCIAL GOLD SAVINGS — POWERED BY ORO GRAIL API
        </motion.p>

        {/* Headline — each word slides up independently */}
        <h1 className="flex flex-col leading-[0.92] mb-12">
          {words.map(({ text, gold }, i) => (
            <div key={text} className="overflow-hidden">
              <motion.span
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: i * 0.1, ease }}
                className={`block text-[18vw] md:text-[14vw] font-bebas ${
                  gold ? 'text-[#C9A84C]' : 'text-white'
                }`}
              >
                {text}
              </motion.span>
            </div>
          ))}
        </h1>

        {/* Tagline + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-8"
        >
          <p className="text-white/40 text-sm leading-relaxed max-w-[260px] font-syne">
            Turn savings goals into gold-backed social commitments.
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={onCreateGoal}
              className="btn-shimmer px-10 py-3.5 bg-[#C9A84C] text-black text-sm tracking-[0.12em] font-bebas hover:bg-[#E8C547] transition-colors duration-200"
            >
              START SAVING
            </button>
            <a
              href="#goals"
              className="text-white/35 text-[11px] tracking-[0.12em] font-mono border-b border-white/15 pb-0.5 hover:text-white/70 hover:border-white/40 transition-colors duration-300"
            >
              SEE GOALS ↓
            </a>
          </div>
        </motion.div>

        {/* Live stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex gap-10 mt-16 pt-10 border-t border-white/[0.08]"
        >
          {[
            { value: loading ? '—' : String(activeCount), label: 'ACTIVE GOALS' },
            { value: loading ? '—' : `${totalGold.toFixed(1)}g`, label: 'GOLD SAVED' },
            { value: loading ? '—' : `$${(totalGold * goldPricePerGram).toLocaleString('en', { maximumFractionDigits: 0 })}`, label: 'USD VALUE' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl md:text-4xl text-[#C9A84C] font-bebas leading-none">
                {value}
              </div>
              <div className="text-white/25 text-[9px] tracking-[0.35em] mt-1.5 font-mono">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-white/15 text-[9px] tracking-[0.4em] font-mono">SCROLL</span>
        <div className="w-px h-14 bg-white/[0.07] overflow-hidden">
          <div className="scroll-line" />
        </div>
      </motion.div>
    </section>
  );
}

/* ── Manifesto ─────────────────────────────────────────────────── */
function ManifestoLine({
  text,
  highlight,
  index,
}: {
  text: string;
  highlight?: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-18% 0px' });

  const parts = highlight ? text.split(highlight) : null;

  return (
    <div ref={ref} className="overflow-hidden py-0.5">
      <motion.h2
        initial={{ y: '108%', skewY: 2 }}
        animate={inView ? { y: 0, skewY: 0 } : {}}
        transition={{ duration: 1.1, delay: index * 0.08, ease }}
        className="text-[8vw] md:text-[6.5vw] text-white font-bebas leading-[0.9]"
      >
        {parts ? (
          <>
            {parts[0]}
            <span className="text-[#C9A84C]">{highlight}</span>
            {parts[1]}
          </>
        ) : text}
      </motion.h2>
    </div>
  );
}

function ManifestoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const lines = [
    { text: 'SAVING IS BROKEN.', highlight: undefined },
    { text: 'DISCIPLINE NEEDS DESIGN.', highlight: 'DESIGN.' },
    { text: 'PROGRESS NEEDS PEOPLE.', highlight: 'PEOPLE.' },
  ];

  return (
    <section className="px-6 md:px-16 py-[14vh] max-w-[1400px] mx-auto">
      <div className="flex gap-12 md:gap-20 items-start">
        {/* Line numbers */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="hidden md:flex flex-col gap-[2.8rem] pt-2 font-mono text-white/15 text-xs select-none"
        >
          <span>01</span>
          <span>02</span>
          <span>03</span>
        </motion.div>

        <div className="flex-1">
          {lines.map((l, i) => (
            <ManifestoLine key={l.text} {...l} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    num: '01',
    title: 'CREATE A GOAL',
    body: 'Set your target in grams of gold. Public commitment with a deadline. No excuses, no resets.',
  },
  {
    num: '02',
    title: 'AUTO-SAVE IN GOLD',
    body: 'Schedule weekly or monthly deposits via GRAIL. Set it, forget it, and watch the grams stack.',
  },
  {
    num: '03',
    title: 'GET SOCIAL SUPPORT',
    body: 'Friends and family gift real gold to celebrate your progress. Social accountability that matters.',
  },
  {
    num: '04',
    title: 'REACH MILESTONES',
    body: 'Unlock achievements, get recognized by the community. Finish what you started.',
  },
];

function FeatureCard({
  num,
  title,
  body,
  index,
}: {
  num: string;
  title: string;
  body: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-70, 70], [5, -5]);
  const rotY = useTransform(mx, [-70, 70], [-5, 5]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  }
  function onMouseLeave() { mx.set(0); my.set(0); }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.07, ease }}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative bg-[#0e0e0e] border border-white/[0.07] p-8 md:p-10 hover:border-[#C9A84C]/35 transition-all duration-500 cursor-default overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,168,76,0.07), transparent 65%)' }} />

      <div className="relative">
        <span className="text-[#C9A84C] text-[10px] tracking-[0.35em] font-mono">{num}</span>
        <h3 className="text-4xl md:text-5xl text-white mt-7 mb-5 leading-none font-bebas">
          {title}
        </h3>
        <p className="text-white/35 text-sm leading-relaxed font-syne">
          {body}
        </p>
      </div>

      {/* Bottom sweep line */}
      <div className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-[#C9A84C] to-transparent transition-all duration-700" />
    </motion.div>
  );
}

function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="px-6 md:px-16 py-[8vh] max-w-[1400px] mx-auto">
      <motion.p
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="text-white/20 text-[10px] tracking-[0.45em] mb-10 font-mono"
      >
        HOW IT WORKS
      </motion.p>

      {/* 2×2 grid separated by 1px lines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.05]">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.num} {...f} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ── Goals Showcase ────────────────────────────────────────────── */
function GoalsShowcase({
  goals,
  loading,
  error,
  goldPricePerGram,
  onGiftSent,
  onRetry,
}: {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  goldPricePerGram: number;
  onGiftSent: (goalId: number, amount: number) => void;
  onRetry: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });

  return (
    <section id="goals" ref={ref} className="py-[10vh]">
      {/* Section header */}
      <div className="px-6 md:px-16 mb-10 max-w-[1400px] mx-auto flex items-end justify-between">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#C9A84C] text-[10px] tracking-[0.45em] mb-4 font-mono"
          >
            COMMUNITY
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease }}
            className="text-6xl md:text-8xl text-white font-bebas leading-none"
          >
            LIVE GOALS
          </motion.h2>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="text-white/15 text-[10px] tracking-[0.25em] pb-2 font-mono"
        >
          {goals.length} GOALS
        </motion.span>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-20">
          <div
            className="w-5 h-5 border border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="px-6 md:px-16 text-center py-16">
          <p className="text-white/25 text-sm mb-5 font-mono">{error}</p>
          <button
            onClick={onRetry}
            className="text-[#C9A84C] text-[10px] tracking-[0.25em] font-mono border-b border-[#C9A84C]/30 pb-0.5 hover:border-[#C9A84C] transition-colors"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Horizontally scrolling cards */}
      {!loading && !error && (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 md:px-16 pb-4">
          {goals.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.055, ease }}
              className="flex-none w-[320px] md:w-[360px]"
            >
              <GoalCard
                goal={goal}
                onGiftSent={onGiftSent}
                goldPricePerGram={goldPricePerGram}
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── CTA ───────────────────────────────────────────────────────── */
function CTASection({ onCreateGoal }: { onCreateGoal: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <section
      ref={ref}
      className="relative min-h-[55vh] flex items-center justify-center overflow-hidden px-6"
    >
      {/* Central gold radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(201,168,76,0.07), transparent)',
        }}
      />
      <div className="relative z-10 text-center">
        <div className="overflow-hidden mb-2">
          <motion.h2
            initial={{ y: '110%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1.1, ease }}
            className="text-[11vw] md:text-[9vw] text-white font-bebas leading-none"
          >
            STOP SAVING
          </motion.h2>
        </div>
        <div className="overflow-hidden mb-12">
          <motion.h2
            initial={{ y: '110%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.08, ease }}
            className="text-[11vw] md:text-[9vw] text-[#C9A84C] font-bebas leading-none"
          >
            ALONE.
          </motion.h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease }}
        >
          <button
            onClick={onCreateGoal}
            className="btn-shimmer px-14 py-4 bg-[#C9A84C] text-black text-sm tracking-[0.18em] font-bebas hover:bg-[#E8C547] transition-colors duration-200"
          >
            CREATE YOUR GOAL
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="px-6 md:px-16 py-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
      <span className="text-white/15 text-[10px] tracking-[0.25em] font-mono">
        GOLDGOALS © 2026
      </span>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-white/15 text-[10px] font-mono tracking-[0.15em]">
        <span>BACKED BY REAL GOLD</span>
        <span className="text-white/10">·</span>
        <span>YOU OWN YOUR ASSETS</span>
        <span className="text-white/10">·</span>
        <span>BUILT ON SOLANA</span>
        <span className="text-white/10">·</span>
        <span>POWERED BY ORO GRAIL API</span>
      </div>
    </footer>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goldPricePerGram, setGoldPricePerGram] = useState(65);

  const fetchGoldPrice = async () => {
    try {
      const res = await fetch('/api/price');
      const result = await res.json();
      if (result.success && result.data?.pricePerGram) {
        setGoldPricePerGram(result.data.pricePerGram);
      }
    } catch {
      // keep default fallback
    }
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/goals');
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to fetch goals');
      setGoals(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchGoldPrice();
  }, []);

  const handleGoalCreated = (newGoal: Goal) => setGoals([newGoal, ...goals]);

  const handleGiftSent = (goalId: number, amount: number) => {
    setGoals(goals.map(goal =>
      goal.id === goalId
        ? { ...goal, current: goal.current + amount, completed: goal.current + amount >= goal.target }
        : goal
    ));
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <GrainOverlay />
      <Nav onCreateGoal={() => setShowCreateModal(true)} />
      <HeroSection
        goals={goals}
        loading={loading}
        goldPricePerGram={goldPricePerGram}
        onCreateGoal={() => setShowCreateModal(true)}
      />
      <ManifestoSection />
      <FeaturesSection />
      <GoalsShowcase
        goals={goals}
        loading={loading}
        error={error}
        goldPricePerGram={goldPricePerGram}
        onGiftSent={handleGiftSent}
        onRetry={fetchGoals}
      />
      <CTASection onCreateGoal={() => setShowCreateModal(true)} />
      <Footer />

      <AnimatePresence>
        {showCreateModal && (
          <CreateGoalModal
            onClose={() => setShowCreateModal(false)}
            onGoalCreated={handleGoalCreated}
            goldPricePerGram={goldPricePerGram}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
