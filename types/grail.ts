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

// ─── Real GRAIL API shapes ────────────────────────────────────────────────────

/** Response from GET /api/users/{userId} */
export interface GrailUserResponse {
  userId: string;
  solanaAddress: string;
  balanceGrams: number;
  createdAt: string;
}

/** Response from GET /api/trading/gold/price */
export interface GrailGoldPriceResponse {
  pricePerGram: number;
  currency: string;
  timestamp: string;
}

/** Request body for POST /api/trading/purchases/user (estimate or purchase) */
export interface GrailPurchaseUserRequest {
  userId: string;
  amountGrams: number;
}

/** Response from purchase estimate endpoint */
export interface GrailBuyEstimateResponse {
  estimatedUsd: number;
  pricePerGram: number;
  fee: number;
}

/** Response from POST /api/trading/purchases/user */
export interface GrailPurchaseResponse {
  purchaseId: string;
  serializedTransaction: string; // base64-encoded unsigned Solana transaction
  estimatedUsd: number;
}

/** Request body for POST /api/transactions/submit */
export interface GrailSubmitRequest {
  purchaseId: string;
  signedTransaction: string; // base64-encoded signed Solana transaction
}

/** Response from POST /api/transactions/submit */
export interface GrailSubmitResponse {
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
}

/** Request body for POST /api/users */
export interface GrailCreateUserRequest {
  userId: string;
  kycHash: string;
}

// ─── Custom error classes ─────────────────────────────────────────────────────

export class GrailApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'GrailApiError';
  }
}

export class GrailInsufficientFundsError extends GrailApiError {
  constructor(message = 'Insufficient funds in partner wallet') {
    super(402, 'INSUFFICIENT_FUNDS', message);
    this.name = 'GrailInsufficientFundsError';
  }
}

export class GrailUserExistsError extends GrailApiError {
  constructor(userId: string) {
    super(409, 'USER_EXISTS', `User already exists: ${userId}`);
    this.name = 'GrailUserExistsError';
  }
}
