// Mock GRAIL API Client
// Production-quality mock that simulates realistic GRAIL API behavior
// Can be easily swapped with real API once credentials are available

import {
  GrailAccount,
  GrailTransaction,
  GrailRecurringPayment,
  GrailApiResponse,
  GoldConversion,
  GrailBalanceResponse,
  GrailTransferRequest,
  GrailRecurringRequest
} from '@/types/grail';

/**
 * In-memory data store for session persistence
 */
class MockGrailStore {
  private accounts: Map<string, GrailAccount> = new Map();
  private transactions: Map<string, GrailTransaction> = new Map();
  private recurringPayments: Map<string, GrailRecurringPayment> = new Map();
  private userAccountMap: Map<string, string> = new Map(); // userId -> accountId
  private goldPriceUsd: number = parseFloat(process.env.GRAIL_MOCK_GOLD_PRICE_USD || '65.00');

  constructor() {
    this.seedTestData();
  }

  /**
   * Seed initial test data for development
   */
  private seedTestData() {
    // Create test accounts for Alice, Bob, Charlie
    const testUsers = [
      { userId: 'alice', balanceGrams: 10.5 },
      { userId: 'bob', balanceGrams: 5.2 },
      { userId: 'charlie', balanceGrams: 15.8 }
    ];

    testUsers.forEach(user => {
      const accountId = this.generateAccountId();
      const account: GrailAccount = {
        id: accountId,
        userId: user.userId,
        solanaAddress: this.generateSolanaAddress(),
        balanceGrams: user.balanceGrams,
        balanceUsd: user.balanceGrams * this.goldPriceUsd,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      this.accounts.set(accountId, account);
      this.userAccountMap.set(user.userId, accountId);
    });
  }

  /**
   * Generate realistic Solana address (44 characters, base58)
   */
  private generateSolanaAddress(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = '';
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }

  /**
   * Generate realistic Solana transaction signature (88 characters, base58)
   */
  private generateSignature(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let signature = '';
    for (let i = 0; i < 88; i++) {
      signature += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return signature;
  }

  /**
   * Generate unique account ID
   */
  private generateAccountId(): string {
    return `grail_acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `grail_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique recurring payment ID
   */
  private generateRecurringId(): string {
    return `grail_rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Simulate network delay (100-500ms)
   */
  private async simulateNetworkDelay(): Promise<void> {
    const delay = 100 + Math.random() * 400;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Get current gold price with realistic fluctuation (±2%)
   */
  private getCurrentGoldPrice(): number {
    const fluctuation = (Math.random() - 0.5) * 0.04; // ±2%
    return this.goldPriceUsd * (1 + fluctuation);
  }

  /**
   * Create new GRAIL account for a user
   */
  async createAccount(userId: string): Promise<GrailAccount> {
    await this.simulateNetworkDelay();

    // Check if user already has an account
    if (this.userAccountMap.has(userId)) {
      const existingAccountId = this.userAccountMap.get(userId)!;
      return this.accounts.get(existingAccountId)!;
    }

    const accountId = this.generateAccountId();
    const account: GrailAccount = {
      id: accountId,
      userId,
      solanaAddress: this.generateSolanaAddress(),
      balanceGrams: 0,
      balanceUsd: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    this.accounts.set(accountId, account);
    this.userAccountMap.set(userId, accountId);

    return account;
  }

  /**
   * Get account balance
   */
  async getBalance(accountId: string): Promise<GrailBalanceResponse> {
    await this.simulateNetworkDelay();

    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    // Update USD balance with current price
    const currentPrice = this.getCurrentGoldPrice();
    account.balanceUsd = account.balanceGrams * currentPrice;
    account.lastUpdated = new Date().toISOString();

    return {
      accountId: account.id,
      balanceGrams: account.balanceGrams,
      balanceUsd: account.balanceUsd,
      lastUpdated: account.lastUpdated
    };
  }

  /**
   * Get account by userId
   */
  async getAccountByUserId(userId: string): Promise<GrailAccount | null> {
    await this.simulateNetworkDelay();

    const accountId = this.userAccountMap.get(userId);
    if (!accountId) {
      return null;
    }

    return this.accounts.get(accountId) || null;
  }

  /**
   * Transfer gold between accounts
   */
  async transfer(request: GrailTransferRequest): Promise<GrailTransaction> {
    await this.simulateNetworkDelay();

    const fromAccount = this.accounts.get(request.fromAccountId);
    const toAccount = this.accounts.get(request.toAccountId);

    if (!fromAccount) {
      throw new Error(`Source account not found: ${request.fromAccountId}`);
    }

    if (!toAccount) {
      throw new Error(`Destination account not found: ${request.toAccountId}`);
    }

    if (fromAccount.balanceGrams < request.amountGrams) {
      throw new Error(
        `Insufficient balance. Available: ${fromAccount.balanceGrams}g, Required: ${request.amountGrams}g`
      );
    }

    // Create transaction
    const transactionId = this.generateTransactionId();
    const currentPrice = this.getCurrentGoldPrice();
    const transaction: GrailTransaction = {
      id: transactionId,
      fromAccountId: request.fromAccountId,
      toAccountId: request.toAccountId,
      amountGrams: request.amountGrams,
      amountUsd: request.amountGrams * currentPrice,
      memo: request.memo,
      signature: this.generateSignature(),
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    // Update balances
    fromAccount.balanceGrams -= request.amountGrams;
    fromAccount.balanceUsd = fromAccount.balanceGrams * currentPrice;
    fromAccount.lastUpdated = new Date().toISOString();

    toAccount.balanceGrams += request.amountGrams;
    toAccount.balanceUsd = toAccount.balanceGrams * currentPrice;
    toAccount.lastUpdated = new Date().toISOString();

    this.transactions.set(transactionId, transaction);

    return transaction;
  }

  /**
   * Create recurring payment (auto-save)
   */
  async createRecurring(request: GrailRecurringRequest): Promise<GrailRecurringPayment> {
    await this.simulateNetworkDelay();

    const account = this.accounts.get(request.accountId);
    if (!account) {
      throw new Error(`Account not found: ${request.accountId}`);
    }

    const recurringId = this.generateRecurringId();

    // Calculate next payment date based on frequency
    const nextDate = new Date();
    switch (request.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }

    const recurring: GrailRecurringPayment = {
      id: recurringId,
      accountId: request.accountId,
      amountGrams: request.amountGrams,
      frequency: request.frequency,
      nextPaymentDate: nextDate.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.recurringPayments.set(recurringId, recurring);

    return recurring;
  }

  /**
   * Pause recurring payment
   */
  async pauseRecurring(recurringId: string): Promise<GrailRecurringPayment> {
    await this.simulateNetworkDelay();

    const recurring = this.recurringPayments.get(recurringId);
    if (!recurring) {
      throw new Error(`Recurring payment not found: ${recurringId}`);
    }

    recurring.status = 'paused';
    return recurring;
  }

  /**
   * Cancel recurring payment
   */
  async cancelRecurring(recurringId: string): Promise<GrailRecurringPayment> {
    await this.simulateNetworkDelay();

    const recurring = this.recurringPayments.get(recurringId);
    if (!recurring) {
      throw new Error(`Recurring payment not found: ${recurringId}`);
    }

    recurring.status = 'cancelled';
    return recurring;
  }

  /**
   * Convert gold to USD
   */
  goldToUsd(grams: number): number {
    return grams * this.getCurrentGoldPrice();
  }

  /**
   * Convert USD to gold
   */
  usdToGold(usd: number): number {
    return usd / this.getCurrentGoldPrice();
  }
}

/**
 * Main GRAIL Client Class
 * Provides interface to GRAIL API functionality
 */
export class GrailClient {
  private store: MockGrailStore;
  private mockMode: boolean;

  constructor() {
    this.mockMode = process.env.GRAIL_MOCK_MODE === 'true';
    this.store = new MockGrailStore();
  }

  /**
   * Create GRAIL account for a user
   */
  async createAccount(userId: string): Promise<GrailApiResponse<GrailAccount>> {
    try {
      const account = await this.store.createAccount(userId);
      return {
        success: true,
        data: account,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_CREATE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get account balance
   */
  async getBalance(accountId: string): Promise<GrailApiResponse<GrailBalanceResponse>> {
    try {
      const balance = await this.store.getBalance(accountId);
      return {
        success: true,
        data: balance,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BALANCE_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get account by userId
   */
  async getAccountByUserId(userId: string): Promise<GrailApiResponse<GrailAccount | null>> {
    try {
      const account = await this.store.getAccountByUserId(userId);
      return {
        success: true,
        data: account,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Transfer gold between accounts
   */
  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amountGrams: number,
    memo?: string
  ): Promise<GrailApiResponse<GrailTransaction>> {
    try {
      const transaction = await this.store.transfer({
        fromAccountId,
        toAccountId,
        amountGrams,
        memo
      });
      return {
        success: true,
        data: transaction,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TRANSFER_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create recurring payment (auto-save)
   */
  async createRecurring(
    accountId: string,
    amountGrams: number,
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  ): Promise<GrailApiResponse<GrailRecurringPayment>> {
    try {
      const recurring = await this.store.createRecurring({
        accountId,
        amountGrams,
        frequency
      });
      return {
        success: true,
        data: recurring,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RECURRING_CREATE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Pause recurring payment
   */
  async pauseRecurring(recurringId: string): Promise<GrailApiResponse<GrailRecurringPayment>> {
    try {
      const recurring = await this.store.pauseRecurring(recurringId);
      return {
        success: true,
        data: recurring,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RECURRING_PAUSE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cancel recurring payment
   */
  async cancelRecurring(recurringId: string): Promise<GrailApiResponse<GrailRecurringPayment>> {
    try {
      const recurring = await this.store.cancelRecurring(recurringId);
      return {
        success: true,
        data: recurring,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RECURRING_CANCEL_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Convert gold grams to USD
   */
  goldToUsd(grams: number): GoldConversion {
    const pricePerGram = parseFloat(process.env.GRAIL_MOCK_GOLD_PRICE_USD || '65.00');
    return {
      grams,
      usd: this.store.goldToUsd(grams),
      pricePerGram,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Convert USD to gold grams
   */
  usdToGold(usd: number): GoldConversion {
    const pricePerGram = parseFloat(process.env.GRAIL_MOCK_GOLD_PRICE_USD || '65.00');
    const grams = this.store.usdToGold(usd);
    return {
      grams,
      usd,
      pricePerGram,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const grailClient = new GrailClient();
