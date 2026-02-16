// Application-specific goal types with GRAIL integration

/**
 * Extended Goal interface with GRAIL integration
 */
export interface Goal {
  id: number;
  title: string;
  creator: string;
  userId: string; // User identifier for GRAIL account
  target: number; // Target grams of gold
  current: number; // Current grams saved
  deadline: string; // ISO date string
  supporters: number; // Count of supporters
  avatar: string; // DiceBear avatar URL
  completed?: boolean;
  grailAccountId?: string; // GRAIL account ID for this goal
  autoSaveConfig?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    amountGrams: number;
    recurringPaymentId?: string; // GRAIL recurring payment ID
  };
  createdAt: string;
  visibility: 'public' | 'private';
}

/**
 * Goal creation request payload
 */
export interface CreateGoalRequest {
  title: string;
  userId: string;
  target: number;
  deadline: string;
  autoSave: boolean;
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  amount?: number; // Auto-save amount in grams
  visibility: 'public' | 'private';
}

/**
 * Gift gold request payload
 */
export interface GiftGoldRequest {
  fromUserId: string;
  goalId: number;
  amount: number; // Grams of gold
  message?: string;
}

/**
 * Gift gold response
 */
export interface GiftGoldResponse {
  success: boolean;
  transactionId: string;
  newBalance: number;
  message: string;
}
