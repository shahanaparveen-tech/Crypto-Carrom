import type { TransactionReason, WalletTransaction } from '@prisma/client';

import { walletRepository } from '../repository/wallet.repository';
import { NotFoundError } from '../../../shared/errors';
import { getPagination, buildPaginationMeta } from '../../../shared/utils/pagination';

export const walletService = {
  async getBalance(
    userId: string,
  ): Promise<{ balance: bigint; gems: bigint; currency: string; status: string }> {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    return {
      balance: wallet.balance,
      gems: wallet.gems,
      currency: wallet.currency,
      status: wallet.status,
    };
  },

  /** Internal: credit premium gems (purchases, rewards). */
  creditGems(userId: string, amount: bigint): Promise<{ gems: bigint }> {
    return walletRepository.adjustGems(userId, amount);
  },

  /** Internal: debit premium gems (shop spend). Throws if insufficient. */
  debitGems(userId: string, amount: bigint): Promise<{ gems: bigint }> {
    return walletRepository.adjustGems(userId, -amount);
  },

  async getTransactions(userId: string, query: { page?: string; limit?: string }) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const { page, limit, skip } = getPagination(query);
    const [items, total] = await walletRepository.listTransactions(wallet.id, skip, limit);
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },

  /** Internal: credit virtual coins (signup bonus, winnings, refund...). */
  credit(
    userId: string,
    amount: bigint,
    reason: TransactionReason,
    referenceId?: string,
  ): Promise<{ balance: bigint; transaction: WalletTransaction }> {
    return walletRepository.adjust({ userId, type: 'CREDIT', reason, amount, referenceId });
  },

  /** Internal: debit virtual coins (match entry, purchase...). Throws if insufficient. */
  debit(
    userId: string,
    amount: bigint,
    reason: TransactionReason,
    referenceId?: string,
  ): Promise<{ balance: bigint; transaction: WalletTransaction }> {
    return walletRepository.adjust({ userId, type: 'DEBIT', reason, amount, referenceId });
  },
};
