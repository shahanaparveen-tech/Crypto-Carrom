import { Card, CoinBadge, Spinner } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { formatCoins, formatDate } from '@shared/utils/format';
import { useWalletBalance, useWalletTransactions } from '../hooks/useWallet';

const reasonLabel = (reason: string): string =>
  reason
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export const WalletPage = (): JSX.Element => {
  const { data: balance } = useWalletBalance();
  const { data: txns, isLoading } = useWalletTransactions(1);

  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-center gap-3 bg-gold/5 py-8 text-center">
        <p className="text-sm uppercase tracking-wide text-felt/60">Wallet balance</p>
        <CoinBadge amount={balance?.wallet.balance ?? '0'} size="lg" />
        <p className="text-xs text-felt/40">{balance?.wallet.currency ?? 'COIN'} · virtual coins</p>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg font-bold text-felt">Transaction history</h2>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : !txns?.data.transactions.length ? (
          <p className="py-8 text-center text-sm text-felt/50">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-gold/10">
            {txns.data.transactions.map((tx) => {
              const credit = tx.type === 'CREDIT';
              return (
                <li key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-felt">{reasonLabel(tx.reason)}</p>
                    <p className="text-xs text-felt/40">{formatDate(tx.createdAt)}</p>
                  </div>
                  <span
                    className={cn(
                      'font-display font-bold',
                      credit ? 'text-emerald-400' : 'text-coin-queen',
                    )}
                  >
                    {credit ? '+' : '−'}
                    {formatCoins(tx.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default WalletPage;
