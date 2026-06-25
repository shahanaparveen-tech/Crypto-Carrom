import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Pencil, X, User as UserIcon } from 'lucide-react';

import { Card, Button, Spinner } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { initials } from '@shared/utils/format';
import { ROUTES } from '@app/config/routes.constants';
import { useAuthState } from '@features/auth/hooks';
import { useWalletBalance } from '@features/wallet/hooks/useWallet';
import { useMyProfile, useUpdateProfile } from '../hooks/useProfile';
import { RankBar } from '../components/RankBar';
import { InfoTab, type ProfileStats } from '../components/InfoTab';
import { AvatarTab } from '../components/AvatarTab';
import { FramesTab } from '../components/FramesTab';
import { STRIKERS, COINS, AVATARS, FRAMES } from '../utils/cosmetics';

type Tab = 'info' | 'avatar' | 'frames';
const TABS: { id: Tab; label: string }[] = [
  { id: 'info', label: 'Info' },
  { id: 'avatar', label: 'Avatar' },
  { id: 'frames', label: 'Frames' },
];

export const ProfilePage = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { data, isLoading } = useMyProfile();
  const { data: walletData } = useWalletBalance();
  const updateProfile = useUpdateProfile();

  const [tab, setTab] = useState<Tab>('info');
  const [striker, setStriker] = useState(STRIKERS[0]!);
  const [coin, setCoin] = useState(COINS[0]!);
  const [avatar, setAvatar] = useState(AVATARS[0]!);
  const [frame, setFrame] = useState(FRAMES[0]!);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const profile = data?.profile;

  if (isLoading || !profile || !user) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  const displayName = profile.displayName ?? user.username;
  const stats: ProfileStats = {
    gamesWon: profile.gamesWon,
    winRate:
      profile.gamesPlayed > 0
        ? `${Math.round((profile.gamesWon / profile.gamesPlayed) * 100)}%`
        : '—',
    currentStreak: profile.winStreak,
    bestStreak: profile.bestStreak,
    worldRank: '—',
    countryRank: '—',
  };

  const copyId = (): void => {
    void navigator.clipboard?.writeText(user.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const saveName = (): void => {
    const name = nameDraft.trim();
    if (name.length >= 2) updateProfile.mutate({ displayName: name });
    setEditingName(false);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 pb-6">
      {/* Header */}
      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              'flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 font-display text-2xl font-bold text-white/90',
              frame.ring,
            )}
            style={{ background: avatar.bg }}
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={displayName}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              initials(displayName)
            )}
          </span>

          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  className="w-full rounded-lg border border-gold/30 bg-maroon-dark/60 px-2 py-1 text-felt outline-none focus:ring-2 focus:ring-gold/50"
                  maxLength={40}
                />
                <button onClick={saveName} className="text-emerald-400" aria-label="Save name">
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="text-felt/50"
                  aria-label="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="truncate font-display text-2xl font-bold text-felt">
                  {displayName}
                </h1>
                <button
                  onClick={() => {
                    setNameDraft(displayName);
                    setEditingName(true);
                  }}
                  className="text-felt/40 transition hover:text-gold-light"
                  aria-label="Edit name"
                >
                  <Pencil size={15} />
                </button>
              </div>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-2">
              {user.isGuest && (
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-light">
                  Guest
                </span>
              )}
              <button
                onClick={copyId}
                className="flex items-center gap-1 rounded-full bg-maroon-dark/50 px-2 py-0.5 text-[11px] text-felt/55 transition hover:text-felt"
                title="Copy ID"
              >
                <UserIcon size={12} />
                {user.isGuest ? 'Guest ID' : 'Player ID'}: {user.id.slice(0, 8)}…
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* Rank explore */}
        <RankBar rating={profile.rating} />
      </Card>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-maroon-dark/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-lg py-2 text-sm font-medium transition',
              tab === t.id
                ? 'bg-gold-gradient font-bold text-maroon-dark'
                : 'text-felt/60 hover:text-felt',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'info' && (
        <InfoTab
          striker={striker}
          coin={coin}
          onSelectStriker={setStriker}
          onSelectCoin={setCoin}
          totalWinnings={walletData?.wallet.balance ?? '0'}
          stats={stats}
        />
      )}
      {tab === 'avatar' && <AvatarTab selected={avatar} onSelect={setAvatar} />}
      {tab === 'frames' && <FramesTab avatar={avatar} selected={frame} onSelect={setFrame} />}

      {/* Back */}
      <Button variant="secondary" size="lg" fullWidth onClick={() => navigate(ROUTES.LOBBY)}>
        <ArrowLeft size={18} /> Back
      </Button>
    </div>
  );
};

export default ProfilePage;
