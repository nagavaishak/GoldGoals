import { NextRequest, NextResponse } from 'next/server';
import { grailClient } from '@/lib/grail';
import { GiftGoldRequest } from '@/types/goal';
import { getGoalById, updateGoalBalance } from '../goals/route';

/**
 * POST /api/gift
 * Gift gold to a goal
 */
export async function POST(request: NextRequest) {
  try {
    const body: GiftGoldRequest = await request.json();

    // Validate required fields
    if (!body.fromUserId || !body.goalId || !body.amount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required fields: fromUserId, goalId, amount'
          }
        },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Amount must be greater than 0'
          }
        },
        { status: 400 }
      );
    }

    // Get the goal
    const goal = getGoalById(body.goalId);
    if (!goal) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Goal not found'
          }
        },
        { status: 404 }
      );
    }

    if (!goal.grailAccountId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Goal does not have a GRAIL account'
          }
        },
        { status: 400 }
      );
    }

    // Step 1: Get sender account (create if doesn't exist)
    let senderAccountResponse = await grailClient.getAccountByUserId(body.fromUserId);
    if (!senderAccountResponse.success || !senderAccountResponse.data) {
      // Create account if it doesn't exist
      senderAccountResponse = await grailClient.createAccount(body.fromUserId);
      if (!senderAccountResponse.success || !senderAccountResponse.data) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Failed to get or create sender account'
            }
          },
          { status: 500 }
        );
      }
    }

    const senderAccount = senderAccountResponse.data;

    // Step 2: Check sender balance
    const balanceResponse = await grailClient.getBalance(senderAccount.id);
    if (!balanceResponse.success || !balanceResponse.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to check sender balance'
          }
        },
        { status: 500 }
      );
    }

    if (balanceResponse.data.balanceGrams < body.amount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Insufficient balance. You have ${balanceResponse.data.balanceGrams.toFixed(3)}g, but need ${body.amount.toFixed(3)}g`
          }
        },
        { status: 400 }
      );
    }

    // Step 3: Execute transfer
    const transferResponse = await grailClient.transfer(
      senderAccount.id,
      goal.grailAccountId,
      body.amount,
      body.message || `Gift for ${goal.title}`
    );

    if (!transferResponse.success || !transferResponse.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: transferResponse.error?.message || 'Transfer failed'
          }
        },
        { status: 500 }
      );
    }

    const transaction = transferResponse.data;

    // Step 4: Update goal balance
    const updatedGoal = updateGoalBalance(body.goalId, body.amount);
    if (!updatedGoal) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to update goal balance'
          }
        },
        { status: 500 }
      );
    }

    // Get updated balance
    const newBalanceResponse = await grailClient.getBalance(senderAccount.id);
    const newBalance = newBalanceResponse.data?.balanceGrams || 0;

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        signature: transaction.signature,
        amountGrams: body.amount,
        amountUsd: transaction.amountUsd,
        newBalance,
        goalNewBalance: updatedGoal.current,
        goalCompleted: updatedGoal.completed
      },
      message: `Successfully gifted ${body.amount}g of gold!`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to process gift'
        }
      },
      { status: 500 }
    );
  }
}
