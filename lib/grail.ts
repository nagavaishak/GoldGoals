// GRAIL API Client
// Supports both mock (in-memory) and real (HTTP) modes.
// Set GRAIL_MOCK_MODE=false in .env.local to use the live API.

import crypto from 'crypto';
import {
  GrailAccount,
  GrailTransaction,
  GrailRecurringPayment,
  GrailApiResponse,
  GoldConversion,
  GrailBalanceResponse,
  GrailTransferRequest,
  GrailRecurringRequest,
  GrailUserResponse,
  GrailGoldPriceResponse,
  GrailPurchaseResponse,
  GrailSubmitRequest,
  GrailCreateUserRequest,
  GrailApiError,
  GrailInsufficientFundsError,
  GrailUserExistsError,
} from '@/types/grail';

// ─── Mock implementation ──────────────────────────────────────────────────────

class MockGrailStore {
  private accounts: Map<string, GrailAccount> = new Map();
  private transactions: Map<string, GrailTransaction> = new Map();
  private recurringPayments: Map<string, GrailRecurringPayment> = new Map();
  private userAccountMap: Map<string, string> = new Map();
  private goldPriceUsd: number = parseFloat(process.env.GRAIL_MOCK_GOLD_PRICE_USD || '65.00');

  constructor() {
    this.seedTestData();
  }

  private seedTestData() {
    const testUsers = [
      { userId: 'alice', balanceGrams: 10.5 },
      { userId: 'bob', balanceGrams: 5.2 },
      { userId: 'charlie', balanceGrams: 15.8 },
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
        lastUpdated: new Date().toISOString(),
      };
      this.accounts.set(accountId, account);
      this.userAccountMap.set(user.userId, accountId);
    });
  }

  private generateSolanaAddress(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = '';
    for (let i = 0; i < 44; i++) address += chars.charAt(Math.floor(Math.random() * chars.length));
    return address;
  }

  private generateSignature(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let sig = '';
    for (let i = 0; i < 88; i++) sig += chars.charAt(Math.floor(Math.random() * chars.length));
    return sig;
  }

  private generateAccountId(): string {
    return `grail_acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionId(): string {
    return `grail_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecurringId(): string {
    return `grail_rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = 100 + Math.random() * 400;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private getCurrentGoldPrice(): number {
    const fluctuation = (Math.random() - 0.5) * 0.04;
    return this.goldPriceUsd * (1 + fluctuation);
  }

  async createAccount(userId: string): Promise<GrailAccount> {
    await this.simulateNetworkDelay();
    if (this.userAccountMap.has(userId)) {
      return this.accounts.get(this.userAccountMap.get(userId)!)!;
    }
    const accountId = this.generateAccountId();
    const account: GrailAccount = {
      id: accountId,
      userId,
      solanaAddress: this.generateSolanaAddress(),
      balanceGrams: 0,
      balanceUsd: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    this.accounts.set(accountId, account);
    this.userAccountMap.set(userId, accountId);
    return account;
  }

  async getBalance(accountId: string): Promise<GrailBalanceResponse> {
    await this.simulateNetworkDelay();
    const account = this.accounts.get(accountId);
    if (!account) throw new Error(`Account not found: ${accountId}`);
    const currentPrice = this.getCurrentGoldPrice();
    account.balanceUsd = account.balanceGrams * currentPrice;
    account.lastUpdated = new Date().toISOString();
    return {
      accountId: account.id,
      balanceGrams: account.balanceGrams,
      balanceUsd: account.balanceUsd,
      lastUpdated: account.lastUpdated,
    };
  }

  async getAccountByUserId(userId: string): Promise<GrailAccount | null> {
    await this.simulateNetworkDelay();
    const accountId = this.userAccountMap.get(userId);
    if (!accountId) return null;
    return this.accounts.get(accountId) || null;
  }

  async transfer(request: GrailTransferRequest): Promise<GrailTransaction> {
    await this.simulateNetworkDelay();
    const fromAccount = this.accounts.get(request.fromAccountId);
    const toAccount = this.accounts.get(request.toAccountId);
    if (!fromAccount) throw new Error(`Source account not found: ${request.fromAccountId}`);
    if (!toAccount) throw new Error(`Destination account not found: ${request.toAccountId}`);
    if (fromAccount.balanceGrams < request.amountGrams) {
      throw new Error(
        `Insufficient balance. Available: ${fromAccount.balanceGrams}g, Required: ${request.amountGrams}g`
      );
    }
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
      completedAt: new Date().toISOString(),
    };
    fromAccount.balanceGrams -= request.amountGrams;
    fromAccount.balanceUsd = fromAccount.balanceGrams * currentPrice;
    fromAccount.lastUpdated = new Date().toISOString();
    toAccount.balanceGrams += request.amountGrams;
    toAccount.balanceUsd = toAccount.balanceGrams * currentPrice;
    toAccount.lastUpdated = new Date().toISOString();
    this.transactions.set(transactionId, transaction);
    return transaction;
  }

  async createRecurring(request: GrailRecurringRequest): Promise<GrailRecurringPayment> {
    await this.simulateNetworkDelay();
    const account = this.accounts.get(request.accountId);
    if (!account) throw new Error(`Account not found: ${request.accountId}`);
    const recurringId = this.generateRecurringId();
    const nextDate = new Date();
    switch (request.frequency) {
      case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
      case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
      case 'biweekly': nextDate.setDate(nextDate.getDate() + 14); break;
      case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
    }
    const recurring: GrailRecurringPayment = {
      id: recurringId,
      accountId: request.accountId,
      amountGrams: request.amountGrams,
      frequency: request.frequency,
      nextPaymentDate: nextDate.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.recurringPayments.set(recurringId, recurring);
    return recurring;
  }

  async pauseRecurring(recurringId: string): Promise<GrailRecurringPayment> {
    await this.simulateNetworkDelay();
    const recurring = this.recurringPayments.get(recurringId);
    if (!recurring) throw new Error(`Recurring payment not found: ${recurringId}`);
    recurring.status = 'paused';
    return recurring;
  }

  async cancelRecurring(recurringId: string): Promise<GrailRecurringPayment> {
    await this.simulateNetworkDelay();
    const recurring = this.recurringPayments.get(recurringId);
    if (!recurring) throw new Error(`Recurring payment not found: ${recurringId}`);
    recurring.status = 'cancelled';
    return recurring;
  }

  getGoldPrice(): number {
    return this.goldPriceUsd;
  }

  goldToUsd(grams: number): number {
    return grams * this.getCurrentGoldPrice();
  }

  usdToGold(usd: number): number {
    return usd / this.getCurrentGoldPrice();
  }
}

// ─── Real HTTP implementation ─────────────────────────────────────────────────

/**
 * Maps a GRAIL user response to the internal GrailAccount shape.
 * In real mode, accountId === userId (GRAIL identifies by userId).
 */
function mapUserToAccount(user: GrailUserResponse): GrailAccount {
  return {
    id: user.userId,
    userId: user.userId,
    solanaAddress: user.solanaAddress,
    balanceGrams: user.balanceGrams,
    balanceUsd: 0, // filled in separately with live price
    createdAt: user.createdAt,
    lastUpdated: new Date().toISOString(),
  };
}

class GrailApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = (process.env.GRAIL_API_URL || 'https://api.grail.oro.finance').replace(/\/$/, '');
    this.apiKey = process.env.GRAIL_API_KEY || '';
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });

    if (!res.ok) {
      let errBody: { message?: string; code?: string } = {};
      try {
        errBody = await res.json();
      } catch {
        // ignore parse errors
      }
      const message = errBody.message || `HTTP ${res.status}`;

      if (res.status === 402) throw new GrailInsufficientFundsError(message);
      if (res.status === 409) throw new GrailUserExistsError(body ? (body as GrailCreateUserRequest).userId ?? 'unknown' : 'unknown');
      if (res.status === 404) throw new GrailApiError(404, 'NOT_FOUND', message);
      throw new GrailApiError(res.status, errBody.code || 'API_ERROR', message);
    }

    return res.json() as Promise<T>;
  }

  async createAccount(userId: string): Promise<GrailAccount> {
    const kycHash = crypto.createHash('sha256').update(userId).digest('hex');
    const payload: GrailCreateUserRequest = { userId, kycHash };
    try {
      const user = await this.request<GrailUserResponse>('POST', '/api/users', payload);
      return mapUserToAccount(user);
    } catch (err) {
      if (err instanceof GrailUserExistsError) {
        // User already exists — fetch instead
        const existing = await this.getAccountByUserId(userId);
        if (existing) return existing;
      }
      throw err;
    }
  }

  async getAccountByUserId(userId: string): Promise<GrailAccount | null> {
    try {
      const user = await this.request<GrailUserResponse>('GET', `/api/users/${encodeURIComponent(userId)}`);
      return mapUserToAccount(user);
    } catch (err) {
      if (err instanceof GrailApiError && err.statusCode === 404) return null;
      throw err;
    }
  }

  async getGoldPrice(): Promise<number> {
    const data = await this.request<GrailGoldPriceResponse>('GET', '/api/trading/gold/price');
    return data.pricePerGram;
  }

  async getBalance(accountId: string): Promise<GrailBalanceResponse> {
    // In real mode accountId === userId
    const user = await this.request<GrailUserResponse>('GET', `/api/users/${encodeURIComponent(accountId)}`);
    const pricePerGram = await this.getGoldPrice();
    return {
      accountId: user.userId,
      balanceGrams: user.balanceGrams,
      balanceUsd: user.balanceGrams * pricePerGram,
      lastUpdated: new Date().toISOString(),
    };
  }

  async buyGoldForUser(userId: string, amountGrams: number): Promise<GrailTransaction> {
    // Lazy import to avoid loading Solana/bs58 in mock mode
    const { signTransaction } = await import('@/lib/solana');

    // Step 1: Initiate purchase
    const purchase = await this.request<GrailPurchaseResponse>(
      'POST',
      '/api/trading/purchases/user',
      { userId, amountGrams }
    );

    // Step 2: Sign the transaction with the partner keypair
    const signedTx = signTransaction(purchase.serializedTransaction);

    // Step 3: Submit the signed transaction
    const submitPayload: GrailSubmitRequest = {
      purchaseId: purchase.purchaseId,
      signedTransaction: signedTx,
    };
    const submitted = await this.request<{ signature: string; status: string }>(
      'POST',
      '/api/transactions/submit',
      submitPayload
    );

    return {
      id: purchase.purchaseId,
      fromAccountId: 'partner_pda',
      toAccountId: userId,
      amountGrams,
      amountUsd: purchase.estimatedUsd,
      signature: submitted.signature,
      status: submitted.status === 'confirmed' ? 'completed' : 'pending',
      createdAt: new Date().toISOString(),
      completedAt: submitted.status === 'confirmed' ? new Date().toISOString() : undefined,
    };
  }

  async transfer(
    _fromUserId: string,
    toUserId: string,
    amountGrams: number,
    _memo?: string
  ): Promise<GrailTransaction> {
    // In custodial mode the partner PDA funds all gifts; sender balance is irrelevant.
    return this.buyGoldForUser(toUserId, amountGrams);
  }

  async createRecurring(): Promise<never> {
    throw new Error(
      'Recurring payments are not yet available in the live GRAIL API. ' +
      'The goal has been saved; recurring will be enabled when the endpoint is confirmed.'
    );
  }
}

// ─── Unified facade ───────────────────────────────────────────────────────────

export class GrailClient {
  private mock: MockGrailStore | null = null;
  private real: GrailApiClient | null = null;
  private isMock: boolean;

  constructor() {
    this.isMock = process.env.GRAIL_MOCK_MODE !== 'false';
    if (this.isMock) {
      this.mock = new MockGrailStore();
    } else {
      this.real = new GrailApiClient();
    }
  }

  async createAccount(userId: string): Promise<GrailApiResponse<GrailAccount>> {
    try {
      const account = this.isMock
        ? await this.mock!.createAccount(userId)
        : await this.real!.createAccount(userId);
      return { success: true, data: account, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: { code: 'ACCOUNT_CREATE_FAILED', message: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getBalance(accountId: string): Promise<GrailApiResponse<GrailBalanceResponse>> {
    try {
      const balance = this.isMock
        ? await this.mock!.getBalance(accountId)
        : await this.real!.getBalance(accountId);
      return { success: true, data: balance, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: { code: 'BALANCE_FETCH_FAILED', message: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getAccountByUserId(userId: string): Promise<GrailApiResponse<GrailAccount | null>> {
    try {
      const account = this.isMock
        ? await this.mock!.getAccountByUserId(userId)
        : await this.real!.getAccountByUserId(userId);
      return { success: true, data: account, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: { code: 'ACCOUNT_FETCH_FAILED', message: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amountGrams: number,
    memo?: string
  ): Promise<GrailApiResponse<GrailTransaction>> {
    try {
      const transaction = this.isMock
        ? await this.mock!.transfer({ fromAccountId, toAccountId, amountGrams, memo })
        : await this.real!.transfer(fromAccountId, toAccountId, amountGrams, memo);
      return { success: true, data: transaction, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: { code: 'TRANSFER_FAILED', message: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async createRecurring(
    accountId: string,
    amountGrams: number,
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  ): Promise<GrailApiResponse<GrailRecurringPayment>> {
    try {
      if (this.isMock) {
        const recurring = await this.mock!.createRecurring({ accountId, amountGrams, frequency });
        return { success: true, data: recurring, timestamp: new Date().toISOString() };
      } else {
        await this.real!.createRecurring();
        // never reaches here; createRecurring always throws in real mode
        throw new Error('Unreachable');
      }
    } catch (error) {
      return {
        success: false,
        error: { code: 'RECURRING_CREATE_FAILED', message: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async pauseRecurring(recurringId: string): Promise<GrailApiResponse<GrailRecurringPayment>> {
    try {
      if (!this.isMock) throw new Error('pauseRecurring not available in real mode');
      const recurring = await this.mock!.pauseRecurring(recurringId);
      return { success: true, data: recurring, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: { code: 'RECURRING_PAUSE_FAILED', message: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async cancelRecurring(recurringId: string): Promise<GrailApiResponse<GrailRecurringPayment>> {
    try {
      if (!this.isMock) throw new Error('cancelRecurring not available in real mode');
      const recurring = await this.mock!.cancelRecurring(recurringId);
      return { success: true, data: recurring, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: { code: 'RECURRING_CANCEL_FAILED', message: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /** Get live gold price per gram (USD). Falls back to env var in mock mode. */
  async getGoldPrice(): Promise<number> {
    if (this.isMock) {
      return this.mock!.getGoldPrice();
    }
    return this.real!.getGoldPrice();
  }

  /** Synchronous USD conversion using the mock price (mock mode only). */
  goldToUsd(grams: number): GoldConversion {
    const pricePerGram = this.mock?.getGoldPrice() ?? parseFloat(process.env.GRAIL_MOCK_GOLD_PRICE_USD || '65.00');
    return {
      grams,
      usd: this.mock ? this.mock.goldToUsd(grams) : grams * pricePerGram,
      pricePerGram,
      timestamp: new Date().toISOString(),
    };
  }

  usdToGold(usd: number): GoldConversion {
    const pricePerGram = this.mock?.getGoldPrice() ?? parseFloat(process.env.GRAIL_MOCK_GOLD_PRICE_USD || '65.00');
    const grams = this.mock ? this.mock.usdToGold(usd) : usd / pricePerGram;
    return {
      grams,
      usd,
      pricePerGram,
      timestamp: new Date().toISOString(),
    };
  }
}

export const grailClient = new GrailClient();
