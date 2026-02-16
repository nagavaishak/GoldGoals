import { NextRequest, NextResponse } from 'next/server';
import { grailClient } from '@/lib/grail';
import { Goal, CreateGoalRequest } from '@/types/goal';

// In-memory storage for goals (replace with database in production)
let goals: Goal[] = [
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
    grailAccountId: undefined // Will be set dynamically
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
    visibility: "public"
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
    visibility: "public"
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
    visibility: "public"
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
    visibility: "public"
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
    completed: true
  },
];

/**
 * GET /api/goals
 * Fetch all goals with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'active' | 'completed'
    const userId = searchParams.get('userId');

    let filteredGoals = [...goals];

    // Filter by status
    if (status === 'completed') {
      filteredGoals = filteredGoals.filter(g => g.completed);
    } else if (status === 'active') {
      filteredGoals = filteredGoals.filter(g => !g.completed);
    }

    // Filter by userId
    if (userId) {
      filteredGoals = filteredGoals.filter(g => g.userId === userId);
    }

    return NextResponse.json({
      success: true,
      data: filteredGoals,
      count: filteredGoals.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch goals'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals
 * Create a new goal with GRAIL account integration
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateGoalRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.userId || !body.target || !body.deadline) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required fields: title, userId, target, deadline'
          }
        },
        { status: 400 }
      );
    }

    // Step 1: Create GRAIL account for this goal
    const accountResponse = await grailClient.createAccount(body.userId);
    if (!accountResponse.success || !accountResponse.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: accountResponse.error?.message || 'Failed to create GRAIL account'
          }
        },
        { status: 500 }
      );
    }

    const grailAccount = accountResponse.data;

    // Step 2: Setup auto-save if enabled
    let recurringPaymentId: string | undefined;
    if (body.autoSave && body.frequency && body.amount) {
      const recurringResponse = await grailClient.createRecurring(
        grailAccount.id,
        body.amount,
        body.frequency
      );

      if (recurringResponse.success && recurringResponse.data) {
        recurringPaymentId = recurringResponse.data.id;
      }
    }

    // Step 3: Create goal
    const newGoal: Goal = {
      id: goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1,
      title: body.title,
      creator: body.userId,
      userId: body.userId,
      target: body.target,
      current: 0,
      deadline: body.deadline,
      supporters: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.userId}`,
      createdAt: new Date().toISOString(),
      visibility: body.visibility || 'public',
      grailAccountId: grailAccount.id,
      autoSaveConfig: body.autoSave
        ? {
            enabled: true,
            frequency: body.frequency!,
            amountGrams: body.amount!,
            recurringPaymentId
          }
        : undefined
    };

    goals.unshift(newGoal); // Add to beginning of array

    return NextResponse.json({
      success: true,
      data: newGoal,
      message: 'Goal created successfully'
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create goal'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to update goal (used by gift API)
 */
export function updateGoalBalance(goalId: number, additionalGrams: number): Goal | null {
  const goalIndex = goals.findIndex(g => g.id === goalId);
  if (goalIndex === -1) return null;

  goals[goalIndex].current += additionalGrams;

  // Check if goal is completed
  if (goals[goalIndex].current >= goals[goalIndex].target) {
    goals[goalIndex].completed = true;
  }

  return goals[goalIndex];
}

/**
 * Helper function to get goal by ID
 */
export function getGoalById(goalId: number): Goal | null {
  return goals.find(g => g.id === goalId) || null;
}
