import { NextResponse } from 'next/server';
import { grailClient } from '@/lib/grail';

// Revalidate every 30 seconds (ISR)
export const revalidate = 30;

/**
 * GET /api/price
 * Returns live gold price per gram in USD.
 * Falls back to GRAIL_MOCK_GOLD_PRICE_USD if the API call fails.
 */
export async function GET() {
  try {
    const pricePerGram = await grailClient.getGoldPrice();
    return NextResponse.json({
      success: true,
      data: {
        pricePerGram,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const fallback = parseFloat(process.env.GRAIL_MOCK_GOLD_PRICE_USD || '65.00');
    console.warn('[price] Failed to fetch live gold price, using fallback:', error);
    return NextResponse.json({
      success: true,
      data: {
        pricePerGram: fallback,
        timestamp: new Date().toISOString(),
        fallback: true,
      },
    });
  }
}
