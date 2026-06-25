import { useMemo, useState } from 'react';
import { Search, Gift, Inbox, DoorOpen, Check, X, Swords, Trash2 } from 'lucide-react';

import { Card, CoinBadge, GemBadge, ActionPill, Spinner } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { useWalletBalance } from '@features/wallet/hooks/useWallet';
import {
  useFriends,
  useFriendRequests,
  useFriendSuggestions,
  useSendFriendRequest,
  useAcceptRequest,
  useDeclineRequest,
  useRemoveFriend,
  useUserSearch,
} from '../hooks/useFriends';
import { useAuthState } from '@features/auth/hooks';
import type { FriendUser } from '../services/friends.api';
import type { Room } from '../services/rooms.api';
import { useCreateRoom } from '../hooks/useRooms';
import { FriendRow } from '../components/FriendRow';
import { RoomModal } from '../components/RoomModal';
import { JoinRoomModal } from '../components/JoinRoomModal';

type Tab = 'challenge' | 'gifts' | 'inbox';

const display = (u: FriendUser): { name: string; level: number; rating: number } => ({
  name: u.profile?.displayName ?? u.username,
  level: u.profile?.level ?? 1,
  rating: u.profile?.rating ?? 1000,
});

const SectionHeading = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <h2 className="font-display text-sm font-bold uppercase tracking-wide text-felt/55">
    {children}
  </h2>
);

const EmptyState = ({
  icon,
  title,
  text,
}: {
  icon: JSX.Element;
  title: string;
  text: string;
}): JSX.Element => (
  <Card className="flex flex-col items-center gap-2 py-16 text-center text-felt/50">
    <span className="text-gold-light/60">{icon}</span>
    <p className="font-display text-lg font-semibold text-felt/75">{title}</p>
    <p className="max-w-sm text-sm">{text}</p>
  </Card>
);

export const FriendsPage = (): JSX.Element => {
  const { data: walletData } = useWalletBalance();
  const friendsQ = useFriends();
  const requestsQ = useFriendRequests();
  const suggestionsQ = useFriendSuggestions();
  const sendReq = useSendFriendRequest();
  const accept = useAcceptRequest();
  const decline = useDeclineRequest();
  const removeFriend = useRemoveFriend();
  const { user } = useAuthState();
  const createRoom = useCreateRoom();

  const [tab, setTab] = useState<Tab>('challenge');
  const [search, setSearch] = useState('');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [showJoin, setShowJoin] = useState(false);

  const friends = friendsQ.data?.friends ?? [];
  const suggestions = suggestionsQ.data?.suggestions ?? [];
  const incoming = requestsQ.data?.incoming ?? [];
  const outgoing = requestsQ.data?.outgoing ?? [];

  const searching = search.trim().length >= 2;
  const searchQ = useUserSearch(search.trim());
  const searchResults = (searchQ.data?.users ?? []).filter((u) => u.id !== user?.id);

  // Relationship lookups so each user shows the right action (like social media).
  const friendIds = useMemo(() => new Set(friends.map((f) => f.user.id)), [friends]);
  const outgoingByUser = useMemo(
    () => new Map(outgoing.map((r) => [r.user.id, r.requestId])),
    [outgoing],
  );
  const incomingByUser = useMemo(
    () => new Map(incoming.map((r) => [r.user.id, r.requestId])),
    [incoming],
  );

  const relationButton = (u: FriendUser): JSX.Element => {
    if (friendIds.has(u.id)) {
      return (
        <ActionPill
          tone="red"
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={() => removeFriend.mutate(u.id)}
        >
          Remove
        </ActionPill>
      );
    }
    const out = outgoingByUser.get(u.id);
    if (out) {
      return (
        <ActionPill tone="gold" size="sm" onClick={() => decline.mutate(out)}>
          Requested
        </ActionPill>
      );
    }
    const inc = incomingByUser.get(u.id);
    if (inc) {
      return (
        <>
          <button
            aria-label="Accept"
            onClick={() => accept.mutate(inc)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-lime-400 to-green-600 text-white shadow ring-1 ring-black/20 active:scale-95"
          >
            <Check size={16} />
          </button>
          <button
            aria-label="Decline"
            onClick={() => decline.mutate(inc)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-rose-500 to-red-700 text-white shadow ring-1 ring-black/20 active:scale-95"
          >
            <X size={16} />
          </button>
        </>
      );
    }
    return (
      <ActionPill
        tone="orange"
        size="sm"
        onClick={() => sendReq.mutate(u.id)}
        disabled={sendReq.isPending}
      >
        Add Friend
      </ActionPill>
    );
  };

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: 'challenge', label: 'Challenge' },
    { id: 'gifts', label: 'Gifts' },
    { id: 'inbox', label: 'Inbox', badge: incoming.length || undefined },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-gold text-shadow-deep">
            Friends
          </h1>
          <p className="mt-1 text-sm text-felt/60">
            Challenge friends, send gifts and play private rooms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GemBadge amount={walletData?.wallet.gems ?? '0'} size="lg" />
          <CoinBadge amount={walletData?.wallet.balance ?? '0'} size="lg" />
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-2xl border border-gold/15 bg-maroon-dark/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative rounded-xl px-6 py-2 font-display text-sm font-bold transition',
              tab === t.id
                ? 'bg-gold-gradient text-maroon-dark shadow'
                : 'text-felt/60 hover:text-felt',
            )}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-maroon">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'challenge' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* Search any player */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-felt/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players to add…"
                className="w-full rounded-xl border border-gold/20 bg-maroon-dark/60 py-2.5 pl-9 pr-3 text-sm text-felt outline-none placeholder:text-felt/40 focus:ring-2 focus:ring-gold/40"
              />
            </div>

            {searching ? (
              /* Search results */
              <div className="space-y-2.5">
                <SectionHeading>Search results</SectionHeading>
                {searchQ.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-7 w-7" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {searchResults.map((u) => {
                      const d = display(u);
                      return (
                        <FriendRow
                          key={u.id}
                          name={d.name}
                          level={d.level}
                          subtitle={`${d.rating} pts`}
                        >
                          {relationButton(u)}
                        </FriendRow>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-felt/45">
                    No players match “{search}”.
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Friends */}
                <div className="space-y-2.5">
                  <SectionHeading>Your friends · {friends.length}</SectionHeading>
                  {friendsQ.isLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner className="h-7 w-7" />
                    </div>
                  ) : friends.length > 0 ? (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {friends.map((f) => {
                        const d = display(f.user);
                        return (
                          <FriendRow
                            key={f.friendshipId}
                            name={d.name}
                            level={d.level}
                            subtitle={`${d.rating} pts`}
                          >
                            <button
                              aria-label="Send gift"
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow ring-1 ring-black/25 transition hover:brightness-105 active:scale-95"
                            >
                              <Gift size={18} />
                            </button>
                            <ActionPill tone="green" icon={<Swords size={15} />}>
                              Challenge
                            </ActionPill>
                            <button
                              aria-label="Remove friend"
                              onClick={() => removeFriend.mutate(f.user.id)}
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-dark/60 text-felt/60 ring-1 ring-black/20 transition hover:text-rose-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </FriendRow>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-6 text-center text-sm text-felt/45">
                      No friends yet — search above or add a suggestion below!
                    </p>
                  )}
                </div>

                {/* Suggested */}
                <div className="space-y-2.5">
                  <SectionHeading>Suggested friends</SectionHeading>
                  {suggestions.length > 0 ? (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {suggestions.map((u) => {
                        const d = display(u);
                        return (
                          <FriendRow
                            key={u.id}
                            name={d.name}
                            level={d.level}
                            subtitle={`${d.rating} pts`}
                          >
                            {relationButton(u)}
                          </FriendRow>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-4 text-sm text-felt/45">No suggestions right now.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <Card className="space-y-3 bg-gradient-to-b from-maroon-light/40 to-maroon-dark/30 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow-lg">
                <DoorOpen size={26} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-felt">Private Room</h3>
                <p className="mt-1 text-sm text-felt/60">
                  Create a room and play with up to 4 friends.
                </p>
              </div>
              <div className="space-y-2 pt-1">
                <ActionPill
                  tone="green"
                  className="w-full"
                  disabled={createRoom.isPending}
                  onClick={() =>
                    createRoom.mutate(
                      { maxPlayers: 4 },
                      { onSuccess: (res) => setActiveRoom(res.room) },
                    )
                  }
                >
                  {createRoom.isPending ? 'Creating…' : 'Create Room'}
                </ActionPill>
                <ActionPill tone="gold" className="w-full" onClick={() => setShowJoin(true)}>
                  Join Room
                </ActionPill>
              </div>
            </Card>
          </aside>
        </div>
      )}

      {tab === 'gifts' && (
        <EmptyState
          icon={<Gift size={44} />}
          title="Daily gifts"
          text="Send and receive coins with your friends — coming soon."
        />
      )}

      {tab === 'inbox' && (
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="space-y-2.5">
            <SectionHeading>Friend requests · {incoming.length}</SectionHeading>
            {incoming.length > 0 ? (
              incoming.map((r) => {
                const d = display(r.user);
                return (
                  <FriendRow
                    key={r.requestId}
                    name={d.name}
                    level={d.level}
                    subtitle={`${d.rating} pts`}
                  >
                    <button
                      aria-label="Accept"
                      onClick={() => accept.mutate(r.requestId)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-lime-400 to-green-600 text-white shadow ring-1 ring-black/20 transition hover:brightness-105 active:scale-95"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      aria-label="Decline"
                      onClick={() => decline.mutate(r.requestId)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-rose-500 to-red-700 text-white shadow ring-1 ring-black/20 transition hover:brightness-105 active:scale-95"
                    >
                      <X size={18} />
                    </button>
                  </FriendRow>
                );
              })
            ) : (
              <EmptyState
                icon={<Inbox size={44} />}
                title="No requests"
                text="Friend requests will show up here."
              />
            )}
          </div>

          {outgoing.length > 0 && (
            <div className="space-y-2.5">
              <SectionHeading>Sent · {outgoing.length}</SectionHeading>
              {outgoing.map((r) => {
                const d = display(r.user);
                return (
                  <FriendRow key={r.requestId} name={d.name} level={d.level} subtitle="Pending…">
                    <ActionPill tone="red" size="sm" onClick={() => decline.mutate(r.requestId)}>
                      Cancel
                    </ActionPill>
                  </FriendRow>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showJoin && (
        <JoinRoomModal
          onJoined={(room) => {
            setShowJoin(false);
            setActiveRoom(room);
          }}
          onClose={() => setShowJoin(false)}
        />
      )}
      {activeRoom && (
        <RoomModal
          room={activeRoom}
          isHost={activeRoom.hostId === user?.id}
          onClose={() => setActiveRoom(null)}
        />
      )}
    </div>
  );
};

export default FriendsPage;
