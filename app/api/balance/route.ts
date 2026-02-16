import { NextRequest, NextResponse } from 'next/server';
import { grailClient } from '@/lib/grail';

/**
 * GET /api/balance?accountId=xxx or ?userId=xxx
 * Get GRAIL account balance with USD conversion
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const userId = searchParams.get('userId');

    if (!accountId && !userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Either accountId or userId is required'
          }
        },
        { status: 400 }
      );
    }

    let resolvedAccountId = accountId;

    // If userId provided, resolve to accountId
    if (!resolvedAccountId && userId) {
      const accountResponse = await grailClient.getAccountByUserId(userId);
      if (!accountResponse.success || !accountResponse.data) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Account not found for user'
            }
          },
          { status: 404 }
        );
      }
      resolvedAccountId = accountResponse.data.id;
    }

    // Get balance
    const balanceResponse = await grailClient.getBalance(resolvedAccountId!);
    if (!balanceResponse.success || !balanceResponse.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: balanceResponse.error?.message || 'Failed to fetch balance'
          }
        },
        { status: 500 }
      );
    }

    const balance = balanceResponse.data;

    // Get USD conversion
    const conversion = grailClient.goldToUsd(balance.balanceGrams);

    return NextResponse.json({
      success: true,
      data: {
        accountId: balance.accountId,
        balanceGrams: balance.balanceGrams,
        balanceUsd: conversion.usd,
        pricePerGram: conversion.pricePerGram,
        lastUpdated: balance.lastUpdated
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch balance'
        }
      },
      { status: 500 }
    );
  }
}
