import { useNavigate } from 'react-router-dom';

import { Card, CoinBadge, GemBadge } from '@shared/components';
import { ROUTES } from '@app/config/routes.constants';
import { useAuthState } from '@features/auth/hooks';
import { useMyProfile } from '@features/profile/hooks/useProfile';
import { useWalletBalance } from '@features/wallet/hooks/useWallet';
import {
  LEFT_RAIL,
  RIGHT_RAIL,
  CENTER_ACTIONS,
  type ActionId,
  type RailItem,
} from '../data/homeContent';
import { PromoStrip } from '../components/PromoStrip';
import { FeaturedPlay } from '../components/FeaturedPlay';
import { ActionButton } from '../components/ActionButton';
import { EventCard } from '../components/EventCard';
import { ChestRow } from '../components/ChestRow';

const SECTIONS = [
  { id: 'events', title: 'Events & mini-games', items: [...LEFT_RAIL, ...RIGHT_RAIL] },
] as const;

const SectionHeading = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <h2 className="mb-3 font-display text-lg font-bold text-felt">{children}</h2>
);

export const LobbyPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { data: profileData } = useMyProfile();
  const { data: walletData } = useWalletBalance();

  const profile = profileData?.profile;
  const name = profile?.displayName ?? user?.username ?? 'Player';

  const onAction = (id: ActionId): void => {
    switch (id) {
      case 'collect':
      case 'jackpot':
        navigate(ROUTES.WALLET);
        break;
      case 'bollywood':
        navigate(ROUTES.LEADERBOARD);
        break;
      case 'play':
        navigate(ROUTES.STAGES);
        break;
    }
  };

  // Decorative rails: dedicated event modules arrive later.
  const onEventClick = (_item: RailItem): void => navigate(ROUTES.WALLET);

  const sideActions = CENTER_ACTIONS.filter((a) => a.id !== 'play');

  return (
    <div className="space-y-8">
      {/* Welcome + currencies */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-felt/60">Welcome back,</p>
          <h1 className="font-display text-3xl font-extrabold text-gold text-shadow-deep">
            {name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <GemBadge amount={walletData?.wallet.gems ?? '0'} size="lg" />
          <CoinBadge amount={walletData?.wallet.balance ?? '0'} size="lg" />
        </div>
      </div>

      {user?.isGuest && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm">
          <span className="text-felt/80">
            You're playing as a <span className="font-semibold text-gold-light">guest</span>. Your
            coins &amp; stats are saved to this account.
          </span>
          <span className="rounded-full bg-maroon-dark/50 px-3 py-1 text-xs text-felt/50">
            Link Google/Facebook to keep them forever — coming soon
          </span>
        </div>
      )}

      {/* Promo strip */}
      <PromoStrip />

      {/* Hero: featured play + secondary actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeaturedPlay />
        </div>
        <div className="flex flex-col gap-4">
          {sideActions.map((action) => (
            <ActionButton key={action.id} action={action} onClick={onAction} />
          ))}
        </div>
      </div>

      {/* Events & mini-games */}
      {SECTIONS.map((section) => (
        <section key={section.id}>
          <SectionHeading>{section.title}</SectionHeading>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {section.items.map((item) => (
              <EventCard key={item.id} item={item} onClick={onEventClick} />
            ))}
          </div>
        </section>
      ))}

      {/* Reward chests */}
      <section>
        <SectionHeading>Reward chests</SectionHeading>
        <Card className="bg-maroon-dark/20">
          <ChestRow />
        </Card>
      </section>
    </div>
  );
};

export default LobbyPage;
