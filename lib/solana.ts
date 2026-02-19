// Solana transaction signing utilities for GRAIL custodial mode
// The partner keypair is loaded once at module init from the env var.

import { Keypair, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

let _keypair: Keypair | null = null;

function getKeypair(): Keypair {
  if (_keypair) return _keypair;

  const secretKeyEnv = process.env.GRAIL_PARTNER_WALLET_SECRET_KEY;
  if (!secretKeyEnv) {
    throw new Error(
      'GRAIL_PARTNER_WALLET_SECRET_KEY is not set. ' +
      'Provide a base58-encoded 64-byte Solana secret key.'
    );
  }

  const secretKeyBytes = bs58.decode(secretKeyEnv);
  if (secretKeyBytes.length !== 64) {
    throw new Error(
      `GRAIL_PARTNER_WALLET_SECRET_KEY must decode to 64 bytes, got ${secretKeyBytes.length}`
    );
  }

  _keypair = Keypair.fromSecretKey(secretKeyBytes);
  return _keypair;
}

/**
 * Sign a base64-encoded serialized Solana transaction.
 * Returns the signed transaction as base64.
 */
export function signTransaction(serializedTxBase64: string): string {
  const keypair = getKeypair();
  const txBuffer = Buffer.from(serializedTxBase64, 'base64');
  const transaction = Transaction.from(txBuffer);
  transaction.sign(keypair);
  return transaction.serialize().toString('base64');
}

/**
 * Return the partner wallet's public key as a base58 string.
 */
export function getPartnerPublicKey(): string {
  return getKeypair().publicKey.toBase58();
}
