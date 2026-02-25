# GoldGoals

**Social gold savings platform — turn financial goals into gold-backed social commitments.**

Built for the [Oro GRAIL Grants Program](https://oro.finance/grail) · Category: Everyday Savings

**Live demo:** https://goldgoals.vercel.app

---

## The Problem

78% of people abandon savings goals within 3 months — because saving is lonely, boring, and easy to quit. GoldGoals makes saving **social, visible, and accountable**, the same way fitness apps like Strava turned running into a social sport.

---

## What's Built

### Core Features
- **Create savings goals** in grams of gold with a deadline and optional auto-save schedule
- **Gift gold** to any goal — P2P gold transfer via GRAIL API executed on-chain
- **Public goal feed** — browse and support the community's goals
- **Live gold price** — fetched from GRAIL API every 30 seconds, displayed throughout the app
- **Persistent storage** — all goals survive server restarts via Supabase Postgres

### GRAIL Integration
| Feature | Status | Implementation |
|---------|--------|----------------|
| Gold price feed | ✅ Live | `GET /api/trading/gold/price` via GRAIL |
| P2P gold transfer (gifting) | ✅ Live | `buyGoldForUser` via GRAIL custodial mode |
| Account creation | ✅ Live | `POST /api/users` via GRAIL |
| Recurring auto-save | ✅ Mock | UI + DB ready; GRAIL endpoint pending |

### Gamification
Goals progress through a state machine: **SET → STACK → BOOST → UNLOCK → COMPLETE**

Each state unlocks milestone markers on the progress bar. Cards show urgency signals (deadline pressure), momentum (recent activity), and a "next unlock" hint to keep users moving.

### Tech Stack
- **Frontend:** Next.js 14 App Router, TypeScript, TailwindCSS, Framer Motion
- **Database:** Supabase Postgres (persistent goal storage)
- **Gold API:** Oro GRAIL (transfers, price feed, account management)
- **Deployment:** Vercel

---

## Architecture

```
app/
  page.tsx              # Main goal feed + hero
  layout.tsx            # Root layout, fonts
  globals.css           # Animations, dark theme
  api/
    goals/route.ts      # GET + POST goals (Supabase)
    gift/route.ts       # POST gift → GRAIL transfer → Supabase update
    price/route.ts      # GET live gold price (30s ISR)
    balance/route.ts    # GET GRAIL account balance

components/
  GoalCard.tsx          # Goal card with gifting modal + state machine
  CreateGoalModal.tsx   # Goal creation with auto-save scheduling

lib/
  grail.ts              # GRAIL API client (mock + real HTTP modes)
  goals-store.ts        # Async CRUD via Supabase
  supabase.ts           # Supabase singleton (server-only)
  solana.ts             # Solana transaction signing for GRAIL custodial mode

types/
  goal.ts               # Goal interface
  grail.ts              # GRAIL API types
```

---

## Running Locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase + GRAIL credentials
npm run dev
```

Open http://localhost:3000

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GRAIL_API_URL=https://api.grail.oro.finance
GRAIL_API_KEY=
GRAIL_MOCK_MODE=true          # set false to use live GRAIL API
```

### Database Setup

Run the SQL in `.env.example` comments (or see `lib/goals-store.ts`) in your Supabase SQL editor to create the `goals` table.

---

## Grant Context

**Category:** Everyday Savings — "Savings challenges (gamified goals with friends)"

**How GoldGoals uses GRAIL:**
- Every "Gift Gold" action executes a real on-chain gold transfer via GRAIL
- Live gold price from GRAIL is shown on every goal card and in the gifting modal
- GRAIL accounts are created per-user when they interact with the platform
- Auto-save scheduling is wired to GRAIL's recurring payment API (pending endpoint availability)

**Why gold beats stablecoins for savings:**
Gold preserves value over 3-12 month goal windows, carries psychological weight ("10g gold" vs "$650"), and has universal gifting significance across cultures.

---

## License

MIT
