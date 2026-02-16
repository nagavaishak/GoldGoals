// GRAIL API Type Definitions
// Complete TypeScript interfaces for GRAIL API contracts

/**
 * GRAIL account structure with Solana blockchain address
 */
export interface GrailAccount {
  id: string;
  userId: string;
  solanaAddress: string;
  balanceGrams: number;
  balanceUsd: number;
  createdAt: string;
  lastUpdated: string;
}

/**
 * GRAIL transaction record for transfers and deposits
 */
export interface GrailTransaction {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amountGrams: number;
  amountUsd: number;
  memo?: string;
  signature: string; // Solana transaction signature
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

/**
 * GRAIL recurring payment configuration for auto-save
 */
export interface GrailRecurringPayment {
  id: string;
  accountId: string;
  amountGrams: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  nextPaymentDate: string;
  status: 'active' | 'paused' | 'cancelled';
  createdAt: string;
  lastPaymentDate?: string;
}

/**
 * Generic API response wrapper
 */
export interface GrailApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * Gold to USD conversion data
 */
export interface GoldConversion {
  grams: number;
  usd: number;
  pricePerGram: number;
  timestamp: string;
}

/**
 * Account balance response
 */
export interface GrailBalanceResponse {
  accountId: string;
  balanceGrams: number;
  balanceUsd: number;
  lastUpdated: string;
}

/**
 * Transfer request payload
 */
export interface GrailTransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amountGrams: number;
  memo?: string;
}

/**
 * Recurring payment creation request
 */
export interface GrailRecurringRequest {
  accountId: string;
  amountGrams: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
}
