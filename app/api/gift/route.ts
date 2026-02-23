import { NextRequest, NextResponse } from 'next/server';
import { grailClient } from '@/lib/grail';
import { GiftGoldRequest } from '@/types/goal';
import { GrailInsufficientFundsError } from '@/types/grail';
import { getGoalById, updateGoalBalance } from '@/lib/goals-store';

/**
 * POST /api/gift
 * Gift gold to a goal.
 * In real (custodial) mode the partner PDA funds the purchase —
 * the sender's balance is irrelevant on-chain.
 */
export async function POST(request: NextRequest) {
  try {
    const body: GiftGoldRequest = await request.json();

    if (!body.fromUserId || !body.goalId || !body.amount) {
      return NextResponse.json(
        { success: false, error: { message: 'Missing required fields: fromUserId, goalId, amount' } },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Amount must be greater than 0' } },
        { status: 400 }
      );
    }

    const goal = await getGoalById(body.goalId);
    if (!goal) {
      return NextResponse.json(
        { success: false, error: { message: 'Goal not found' } },
        { status: 404 }
      );
    }

    if (!goal.grailAccountId) {
      return NextResponse.json(
        { success: false, error: { message: 'Goal does not have a GRAIL account' } },
        { status: 400 }
      );
    }

    // Ensure recipient account exists (creates if needed)
    const recipientResponse = await grailClient.getAccountByUserId(goal.userId);
    if (!recipientResponse.success || !recipientResponse.data) {
      await grailClient.createAccount(goal.userId);
    }

    // Execute transfer (real mode: partner PDA → recipient; mock: sender → recipient)
    const transferResponse = await grailClient.transfer(
      body.fromUserId,
      goal.grailAccountId,
      body.amount,
      body.message || `Gift for ${goal.title}`
    );

    if (!transferResponse.success || !transferResponse.data) {
      return NextResponse.json(
        { success: false, error: { message: transferResponse.error?.message || 'Transfer failed' } },
        { status: 500 }
      );
    }

    const transaction = transferResponse.data;

    const updatedGoal = await updateGoalBalance(body.goalId, body.amount);
    if (!updatedGoal) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to update goal balance' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        signature: transaction.signature,
        amountGrams: body.amount,
        amountUsd: transaction.amountUsd,
        goalNewBalance: updatedGoal.current,
        goalCompleted: updatedGoal.completed,
      },
      message: `Successfully gifted ${body.amount}g of gold!`,
    });
  } catch (error) {
    if (error instanceof GrailInsufficientFundsError) {
      return NextResponse.json(
        { success: false, error: { message: 'Partner wallet has insufficient funds to complete this gift. Please try again later.' } },
        { status: 402 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : 'Failed to process gift' } },
      { status: 500 }
    );
  }
}
