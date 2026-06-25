import { Bell, CheckCheck, Trophy, UserPlus, Wallet, Info } from 'lucide-react';

import { Card, Spinner } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { formatDate } from '@shared/utils/format';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../hooks/useNotifications';

const iconFor = (type: string): JSX.Element => {
  switch (type) {
    case 'FRIEND_REQUEST':
      return <UserPlus size={18} />;
    case 'MATCH_RESULT':
      return <Trophy size={18} />;
    case 'WALLET':
      return <Wallet size={18} />;
    default:
      return <Info size={18} />;
  }
};

export const NotificationsPage = (): JSX.Element => {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = data?.notifications ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow-lg">
            <Bell size={22} />
          </span>
          <div>
            <h1 className="font-display text-3xl font-extrabold text-gold text-shadow-deep">
              Notifications
            </h1>
            {data && data.unread > 0 && (
              <p className="text-sm text-felt/60">{data.unread} unread</p>
            )}
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => markAll.mutate()}
            className="flex items-center gap-1.5 rounded-xl border border-gold/25 bg-maroon-dark/50 px-3 py-2 text-sm text-felt/80 transition hover:text-felt"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-9 w-9" />
        </div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-center text-felt/50">
          <Bell size={40} className="text-gold-light/60" />
          <p className="font-display text-lg font-semibold text-felt/75">All caught up</p>
          <p className="text-sm">You have no notifications yet.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markRead.mutate(n.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-panel transition',
                n.isRead
                  ? 'border-gold/10 bg-maroon-dark/20 text-felt/60'
                  : 'border-gold/30 bg-gradient-to-b from-wood/40 to-wood-dark/30 text-felt hover:brightness-105',
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/20 text-gold-light">
                {iconFor(n.type)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold">{n.title}</p>
                {n.body && <p className="truncate text-xs text-felt/55">{n.body}</p>}
                <p className="mt-0.5 text-[10px] text-felt/40">{formatDate(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
