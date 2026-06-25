import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

import { Switch, SectionRibbon } from '@shared/components';
import type { UserSettings } from '@shared/types/domain.types';
import { useAuthState } from '@features/auth/hooks';
import { useSettings, useUpdateSettings } from '@features/settings/hooks/useSettings';
import { GameModal } from './GameModal';

const APP_VERSION = '0.1.0 · dev';

const Row = ({ label, children }: { label: string; children: React.ReactNode }): JSX.Element => (
  <div className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-b from-wood/60 to-wood-dark/50 px-4 py-3 ring-1 ring-black/15">
    <span className="font-display font-semibold text-felt">{label}</span>
    {children}
  </div>
);

export const GameSettingsModal = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const { user } = useAuthState();
  const { data } = useSettings();
  const update = useUpdateSettings();
  const s = data?.settings;
  const patch = (body: Partial<UserSettings>): void => update.mutate(body);

  // Session-only game toggles (no backend field yet).
  const [local, setLocal] = useState({
    chat: true,
    friendsOnly: false,
    trails: true,
    tapToPlace: true,
    pocketEffects: true,
  });
  const set = (k: keyof typeof local) => (v: boolean) => setLocal((p) => ({ ...p, [k]: v }));
  const [copied, setCopied] = useState(false);

  const copyId = (): void => {
    if (!user) return;
    void navigator.clipboard?.writeText(user.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <GameModal title="Settings" onClose={onClose}>
      <div className="max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
        <SectionRibbon title="Game Options" tone="orange" />

        <Row label="Sound Effects">
          <Switch
            checked={s?.soundEnabled ?? true}
            disabled={!s}
            onChange={(v) => patch({ soundEnabled: v })}
          />
        </Row>
        <Row label="Vibration">
          <Switch
            checked={s?.vibrationEnabled ?? false}
            disabled={!s}
            onChange={(v) => patch({ vibrationEnabled: v })}
          />
        </Row>
        <Row label="Chat Messages">
          <Switch checked={local.chat} onChange={set('chat')} />
        </Row>
        <Row label="Get challenges from friends only">
          <Switch checked={local.friendsOnly} onChange={set('friendsOnly')} />
        </Row>
        <Row label="Show striker trails">
          <Switch checked={local.trails} onChange={set('trails')} />
        </Row>
        <Row label="Tap to place striker">
          <Switch checked={local.tapToPlace} onChange={set('tapToPlace')} />
        </Row>
        <Row label="Show notifications while playing">
          <Switch
            checked={s?.notificationsEnabled ?? true}
            disabled={!s}
            onChange={(v) => patch({ notificationsEnabled: v })}
          />
        </Row>
        <Row label="Show pocket effects">
          <Switch checked={local.pocketEffects} onChange={set('pocketEffects')} />
        </Row>

        <SectionRibbon title="Info" tone="orange" />

        <Row label="Version">
          <span className="font-mono text-xs text-felt/70">{APP_VERSION}</span>
        </Row>
        {user && (
          <Row label="User Id">
            <button
              onClick={copyId}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-maroon-dark/50 px-3 py-1.5 text-xs text-felt/80 transition hover:text-felt"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </Row>
        )}
      </div>
    </GameModal>
  );
};
