// In-memory goal store shared between API routes
import { Goal } from '@/types/goal';

export let goals: Goal[] = [
  {
    id: 1,
    title: "Save for Japan trip 🇯🇵",
    creator: "Alice",
    userId: "alice",
    target: 10,
    current: 6.5,
    deadline: "2026-08-15",
    supporters: 8,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    createdAt: "2026-01-15T10:00:00.000Z",
    visibility: "public",
    grailAccountId: undefined,
  },
  {
    id: 2,
    title: "Emergency fund safety net",
    creator: "Bob",
    userId: "bob",
    target: 5,
    current: 2.3,
    deadline: "2026-06-01",
    supporters: 3,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    createdAt: "2026-01-10T10:00:00.000Z",
    visibility: "public",
  },
  {
    id: 3,
    title: "Dream wedding 💍",
    creator: "Charlie",
    userId: "charlie",
    target: 20,
    current: 14.8,
    deadline: "2026-12-20",
    supporters: 15,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    createdAt: "2026-01-05T10:00:00.000Z",
    visibility: "public",
  },
  {
    id: 4,
    title: "Starting my business",
    creator: "Diana",
    userId: "diana",
    target: 15,
    current: 4.2,
    deadline: "2026-10-01",
    supporters: 6,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
    createdAt: "2026-01-20T10:00:00.000Z",
    visibility: "public",
  },
  {
    id: 5,
    title: "House down payment 🏡",
    creator: "Eve",
    userId: "eve",
    target: 50,
    current: 18.5,
    deadline: "2027-03-15",
    supporters: 12,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
    createdAt: "2026-01-25T10:00:00.000Z",
    visibility: "public",
  },
  {
    id: 6,
    title: "Master's degree fund",
    creator: "Frank",
    userId: "frank",
    target: 8,
    current: 8,
    deadline: "2026-04-01",
    supporters: 9,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
    createdAt: "2026-01-01T10:00:00.000Z",
    visibility: "public",
    completed: true,
  },
];

export function getGoalById(goalId: number): Goal | null {
  return goals.find(g => g.id === goalId) || null;
}

export function updateGoalBalance(goalId: number, additionalGrams: number): Goal | null {
  const idx = goals.findIndex(g => g.id === goalId);
  if (idx === -1) return null;
  goals[idx].current += additionalGrams;
  if (goals[idx].current >= goals[idx].target) {
    goals[idx].completed = true;
  }
  return goals[idx];
}
