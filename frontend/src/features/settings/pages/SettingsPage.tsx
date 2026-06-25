import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Apple,
  Users,
  Camera,
  ThumbsUp,
  LogOut,
  Play,
  GraduationCap,
  Languages,
  Volume2,
  Music,
  Vibrate,
  MessageSquare,
  Swords,
  Megaphone,
  Bell,
  Sparkles,
  Gamepad2,
  LifeBuoy,
  ScrollText,
  ShieldCheck,
  Trash2,
  Award,
  Info,
  Copy,
  Check,
} from 'lucide-react';

import { Spinner, ActionPill, SectionRibbon, Switch } from '@shared/components';
import type { UserSettings } from '@shared/types/domain.types';
import { ROUTES } from '@app/config/routes.constants';
import { useAuthState, useLogout } from '@features/auth/hooks';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { SettingsRow } from '../components/SettingsRow';

const APP_VERSION = '0.1.0 · dev';

const LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'ar', label: 'Arabic' },
];

export const SettingsPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { data, isLoading } = useSettings();
  const update = useUpdateSettings();
  const logout = useLogout();

  // UI-only toggles without a backend field yet.
  const [local, setLocal] = useState({
    chat: true,
    friendsOnly: false,
    targetedAds: true,
    pocketEffects: true,
  });
  const [copied, setCopied] = useState(false);

  const settings = data?.settings;

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  const patch = (body: Partial<UserSettings>): void => update.mutate(body);
  const busy = update.isPending;

  const handleLogout = async (): Promise<void> => {
    await logout.mutateAsync();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const copyId = (): void => {
    if (!user) return;
    void navigator.clipboard?.writeText(user.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const openExternal = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-10">
      <h1 className="text-center font-display text-3xl font-extrabold text-gold text-shadow-deep">
        Settings
      </h1>

      {/* ── Account ─────────────────────────────── */}
      <SectionRibbon title="Account" />

      <SettingsRow icon={<Users size={20} />} label="Login with Facebook" hint="Play with friends!">
        <ActionPill tone="blue" icon={<Users size={16} />} disabled title="Coming soon">
          Login
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<Apple size={20} />} label="Sign in with Apple">
        <ActionPill tone="apple" icon={<Apple size={16} />} disabled title="Coming soon">
          Sign in
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<LogOut size={20} />} label="Logout">
        <ActionPill
          tone="red"
          icon={<LogOut size={16} />}
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          Logout
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<GraduationCap size={20} />} label="Tutorial">
        <ActionPill
          tone="green"
          icon={<Play size={16} fill="currentColor" />}
          onClick={() => navigate(ROUTES.PRACTICE)}
        >
          Play
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<Gamepad2 size={20} />} label="Practice Mode">
        <ActionPill
          tone="green"
          icon={<Play size={16} fill="currentColor" />}
          onClick={() => navigate(ROUTES.PRACTICE)}
        >
          Play
        </ActionPill>
      </SettingsRow>

      {/* ── Social ──────────────────────────────── */}
      <SectionRibbon title="Social" />

      <SettingsRow icon={<Camera size={20} />} label="Follow us on Instagram" reward={10} alert>
        <ActionPill tone="green" onClick={() => openExternal('https://instagram.com')}>
          Follow
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<ThumbsUp size={20} />} label="Like our Facebook Page" reward={10} alert>
        <ActionPill tone="green" onClick={() => openExternal('https://facebook.com')}>
          Like
        </ActionPill>
      </SettingsRow>

      {/* ── Game Options ────────────────────────── */}
      <SectionRibbon title="Game Options" />

      <SettingsRow icon={<Languages size={20} />} label="Language">
        <select
          value={settings.language}
          disabled={busy}
          onChange={(e) => patch({ language: e.target.value })}
          className="rounded-xl border border-gold/30 bg-maroon-dark/70 px-4 py-2.5 text-sm font-semibold text-felt outline-none focus:ring-2 focus:ring-gold/50"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </SettingsRow>

      <SettingsRow icon={<Volume2 size={20} />} label="Sound Effects">
        <Switch
          checked={settings.soundEnabled}
          disabled={busy}
          onChange={(v) => patch({ soundEnabled: v })}
          label="Sound Effects"
        />
      </SettingsRow>

      <SettingsRow icon={<Music size={20} />} label="Music">
        <Switch
          checked={settings.musicEnabled}
          disabled={busy}
          onChange={(v) => patch({ musicEnabled: v })}
          label="Music"
        />
      </SettingsRow>

      <SettingsRow icon={<Vibrate size={20} />} label="Vibration">
        <Switch
          checked={settings.vibrationEnabled}
          disabled={busy}
          onChange={(v) => patch({ vibrationEnabled: v })}
          label="Vibration"
        />
      </SettingsRow>

      <SettingsRow icon={<MessageSquare size={20} />} label="Chat Messages">
        <Switch
          checked={local.chat}
          onChange={(v) => setLocal((s) => ({ ...s, chat: v }))}
          label="Chat Messages"
        />
      </SettingsRow>

      <SettingsRow icon={<Swords size={20} />} label="Get challenges from friends only">
        <Switch
          checked={local.friendsOnly}
          onChange={(v) => setLocal((s) => ({ ...s, friendsOnly: v }))}
          label="Challenges from friends only"
        />
      </SettingsRow>

      <SettingsRow icon={<Megaphone size={20} />} label="Targeted Ads">
        <Switch
          checked={local.targetedAds}
          onChange={(v) => setLocal((s) => ({ ...s, targetedAds: v }))}
          label="Targeted Ads"
        />
      </SettingsRow>

      <SettingsRow icon={<Bell size={20} />} label="Show notifications while playing">
        <Switch
          checked={settings.notificationsEnabled}
          disabled={busy}
          onChange={(v) => patch({ notificationsEnabled: v })}
          label="Notifications while playing"
        />
      </SettingsRow>

      <SettingsRow icon={<Sparkles size={20} />} label="Show pocket effects">
        <Switch
          checked={local.pocketEffects}
          onChange={(v) => setLocal((s) => ({ ...s, pocketEffects: v }))}
          label="Pocket effects"
        />
      </SettingsRow>

      {/* ── Info ────────────────────────────────── */}
      <SectionRibbon title="Info" />

      <SettingsRow icon={<Gamepad2 size={20} />} label="More Games">
        <ActionPill tone="blue" onClick={() => navigate(ROUTES.LOBBY)}>
          View
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<LifeBuoy size={20} />} label="Help & Support">
        <ActionPill tone="green" onClick={() => openExternal('https://example.com/support')}>
          View
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<ScrollText size={20} />} label="Terms & Conditions">
        <ActionPill tone="green" onClick={() => openExternal('https://example.com/terms')}>
          View
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<ShieldCheck size={20} />} label="Privacy Policy">
        <ActionPill tone="green" onClick={() => openExternal('https://example.com/privacy')}>
          View
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<Trash2 size={20} />} label="Delete Account">
        <ActionPill
          tone="red"
          icon={<Trash2 size={16} />}
          onClick={() => window.alert('Account deletion will be available soon.')}
        >
          Delete
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<Award size={20} />} label="Credits">
        <ActionPill tone="green" onClick={() => navigate(ROUTES.LOBBY)}>
          View
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<Info size={20} />} label="Mini-Games Information">
        <ActionPill tone="green" onClick={() => navigate(ROUTES.LOBBY)}>
          View
        </ActionPill>
      </SettingsRow>

      <SettingsRow icon={<Info size={20} />} label="Version" hint={APP_VERSION}>
        <span className="font-mono text-sm text-felt/60">{APP_VERSION}</span>
      </SettingsRow>

      {user && (
        <SettingsRow icon={<Info size={20} />} label="User Id" hint={user.id}>
          <button
            onClick={copyId}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gold/25 bg-maroon-dark/60 px-3 py-2 text-xs text-felt/70 transition hover:text-felt"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </SettingsRow>
      )}
    </div>
  );
};

export default SettingsPage;
