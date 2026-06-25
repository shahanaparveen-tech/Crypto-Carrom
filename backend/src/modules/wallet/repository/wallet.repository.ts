import type {
  Prisma,
  Wallet,
  WalletTransaction,
  TransactionType,
  TransactionReason,
} from '@prisma/client';

import { prisma } from '../../../app/config/prisma';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../../../shared/errors';

export interface AdjustParams {
  userId: string;
  type: TransactionType;
  reason: TransactionReason;
  amount: bigint;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export const walletRepository = {
  findByUserId(userId: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({ where: { userId } });
  },

  listTransactions(
    walletId: string,
    skip: number,
    take: number,
  ): Promise<[WalletTransaction[], number]> {
    return Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.walletTransaction.count({ where: { walletId } }),
    ]);
  },

  /**
   * Atomically applies a credit/debit and writes a ledger row. Uses optimistic
   * locking (`balance: before`) so concurrent updates can't corrupt the balance.
   */
  adjust(params: AdjustParams): Promise<{ balance: bigint; transaction: WalletTransaction }> {
    const { userId, type, reason, amount, referenceId, metadata } = params;
    if (amount <= 0n) throw new BadRequestError('Amount must be positive');

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundError('Wallet not found');
      if (wallet.status !== 'ACTIVE') throw new ForbiddenError('Wallet is frozen');

      const before = wallet.balance;
      const after = type === 'CREDIT' ? before + amount : before - amount;
      if (after < 0n) throw new BadRequestError('Insufficient funds');

      const updated = await tx.wallet.updateMany({
        where: { id: wallet.id, balance: before },
        data: { balance: after },
      });
      if (updated.count === 0) {
        throw new ConflictError('Concurrent wallet update — please retry');
      }

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type,
          reason,
          amount,
          balanceBefore: before,
          balanceAfter: after,
          referenceId: referenceId ?? null,
          metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });

      return { balance: after, transaction };
    });
  },

  /** Atomically add (or subtract, if negative) premium gems. */
  adjustGems(userId: string, delta: bigint): Promise<{ gems: bigint }> {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundError('Wallet not found');
      if (wallet.status !== 'ACTIVE') throw new ForbiddenError('Wallet is frozen');

      const after = wallet.gems + delta;
      if (after < 0n) throw new BadRequestError('Insufficient gems');

      const updated = await tx.wallet.updateMany({
        where: { id: wallet.id, gems: wallet.gems },
        data: { gems: after },
      });
      if (updated.count === 0) throw new ConflictError('Concurrent wallet update — please retry');

      return { gems: after };
    });
  },
};
