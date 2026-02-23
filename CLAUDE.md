# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoldGoals is a social gold savings platform where users create public savings goals, challenge friends to save, and gift gold to celebrate progress. Built for the Oro GRAIL Grants Program.

**Tech Stack**: Next.js 14 (App Router), TypeScript, TailwindCSS, Oro GRAIL API (planned)

## Development Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000
npm run dev -- -p 3001  # Use alternate port if 3000 is busy

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run Next.js linter
```

## Architecture

### Current State (MVP/Demo)
- Frontend-only application with mock data
- No database, authentication, or backend API yet
- GRAIL API integration is **planned** but not yet implemented
- All goal data is currently hardcoded in `MOCK_GOALS` array in `app/page.tsx`

### Project Structure
```
/app
  page.tsx          # Main landing page with goal feed and hero section
  layout.tsx        # Root layout with metadata
  globals.css       # Global Tailwind styles

/components
  GoalCard.tsx      # Individual goal display with progress tracking
  CreateGoalModal.tsx  # Modal form for creating new goals
```

### Key Data Model
The `Goal` interface (defined in `components/GoalCard.tsx`) represents the core data structure:
```typescript
{
  id: number
  title: string       // User-defined goal name
  creator: string     // Username
  target: number      // Target grams of gold
  current: number     // Current grams saved
  deadline: string    // ISO date string
  supporters: number  // Count of supporters
  avatar: string      // DiceBear avatar URL
  completed?: boolean // Optional completion flag
}
```

### Component Architecture
- All components use `'use client'` directive (client-side rendering)
- State management is local (React `useState`) - no global state management library
- No prop drilling yet; components are relatively flat
- Modal patterns use conditional rendering with backdrop overlay

### Styling Conventions
- **Color scheme**: Amber/yellow gradient theme for gold aesthetic
  - Primary: `from-yellow-500 to-amber-600`
  - Accents: `amber-50`, `amber-100`, `amber-200` backgrounds
  - Text: `text-amber-600`, `text-amber-700`
- Completed goals use green (`green-400`, `emerald-500`)
- Responsive grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Hover effects: `hover:shadow-lg transition-all hover:scale-105`

## Future Integration Points

### GRAIL API (Not Yet Implemented)
When implementing GRAIL integration, the following operations are planned:
- **Account creation**: Create gold accounts for users
- **Recurring deposits**: Weekly/monthly auto-save via `grail.recurring.create()`
- **P2P transfers**: Gold gifting between users via `grail.transfer()`

Reference the README.md "GRAIL Integration Plan" section for pseudocode examples.

### Planned Features (Not Built)
- User authentication
- Database persistence (goals currently stored in state only)
- Real gold account balances
- Achievement/milestone system
- Leaderboards
- Notifications

## Development Workflow

### Adding New Components
- Place in `/components` directory
- Use TypeScript with proper interface definitions
- Include `'use client'` directive if component uses hooks or browser APIs
- Match existing amber/gold color scheme
- Ensure responsive design (mobile-first approach)

### Modifying Goals
Currently, goals are mock data. To add/edit goals:
1. Modify the `MOCK_GOALS` array in `app/page.tsx`
2. Ensure new goals follow the `Goal` interface structure
3. Use DiceBear API for avatars: `https://api.dicebear.com/7.x/avataaars/svg?seed={name}`

### Testing Changes
1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. Test responsive design using browser DevTools
4. Verify goal creation modal flow (currently shows demo alert)

## Important Notes

- **No real transactions**: The "Gift Gold" and "Create Goal" buttons currently show demo alerts
- **No persistence**: Page refreshes reset all state to `MOCK_GOALS`
- **Avatar generation**: Uses DiceBear's Avataaars style - consistent seed = consistent avatar
- **Deployment target**: Vercel (optimized for Next.js)
- **No environment variables** needed for current MVP

## Grant Context

Built for Oro GRAIL Grants Program (Category: Everyday Savings). The application demonstrates:
- Gold's utility for medium-term savings goals (3-12 months)
- Social accountability mechanics similar to fitness apps
- Use case for recurring GRAIL transactions
- Gamification of savings behavior

When implementing real features, prioritize those that demonstrate GRAIL API capabilities (recurring payments, P2P transfers, gold account management).
