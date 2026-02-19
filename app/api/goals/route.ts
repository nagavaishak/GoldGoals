import { NextRequest, NextResponse } from 'next/server';
import { grailClient } from '@/lib/grail';
import { goals } from '@/lib/goals-store';
import { Goal, CreateGoalRequest } from '@/types/goal';

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

    if (status === 'completed') {
      filteredGoals = filteredGoals.filter(g => g.completed);
    } else if (status === 'active') {
      filteredGoals = filteredGoals.filter(g => !g.completed);
    }

    if (userId) {
      filteredGoals = filteredGoals.filter(g => g.userId === userId);
    }

    return NextResponse.json({
      success: true,
      data: filteredGoals,
      count: filteredGoals.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : 'Failed to fetch goals' } },
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

    if (!body.title || !body.userId || !body.target || !body.deadline) {
      return NextResponse.json(
        { success: false, error: { message: 'Missing required fields: title, userId, target, deadline' } },
        { status: 400 }
      );
    }

    // Step 1: Create GRAIL account for this goal
    const accountResponse = await grailClient.createAccount(body.userId);
    if (!accountResponse.success || !accountResponse.data) {
      return NextResponse.json(
        { success: false, error: { message: accountResponse.error?.message || 'Failed to create GRAIL account' } },
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
      } else if (!recurringResponse.success) {
        // Recurring payments are not yet available in the live API; log and continue.
        console.warn('[goals] createRecurring skipped:', recurringResponse.error?.message);
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
            recurringPaymentId,
          }
        : undefined,
    };

    goals.unshift(newGoal);

    return NextResponse.json({
      success: true,
      data: newGoal,
      message: 'Goal created successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : 'Failed to create goal' } },
      { status: 500 }
    );
  }
}
