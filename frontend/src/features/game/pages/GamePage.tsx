import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Menu, Coins } from 'lucide-react';

import { Avatar } from '@shared/components';
import { ROUTES } from '@app/config/routes.constants';
import { useAuthState } from '@features/auth/hooks';
import { useMyProfile } from '@features/profile/hooks/useProfile';
import { GameCanvas, type GameScore } from '../components/GameCanvas';
import type { Difficulty } from '../ai/aiPlayer';
import { GameChat } from '../components/GameChat';
import { GameMenu } from '../components/GameMenu';
import { GameSettingsModal } from '../components/GameSettingsModal';
import { LeaveMatchModal } from '../components/LeaveMatchModal';
import { randomReply, type ChatKind, type ChatMessage } from '../data/quickChat';

const emptyScore: GameScore = {
  white: 0,
  black: 0,
  queen: 0,
  remaining: 18,
  fouls: 0,
  cleared: false,
  currentPlayer: 0,
  winner: null,
  queenStatus: 'ON_BOARD',
  queenOwner: null,
  thinking: false,
};

const POT = '1 000';

const Puck = ({ color, ring }: { color: string; ring: string }): JSX.Element => (
  <span
    className="relative inline-flex h-6 w-6 items-center justify-center rounded-full"
    style={{ background: color, boxShadow: `inset 0 0 0 3px ${ring}` }}
  >
    <span className="h-2.5 w-2.5 rounded-full bg-black/30" />
  </span>
);

const Bubble = ({ text }: { text: string | null }): JSX.Element | null =>
  text ? (
    <span className="mt-1 max-w-[8rem] truncate rounded-xl rounded-tl-sm bg-white px-2 py-1 text-xs font-semibold text-maroon-dark shadow-lg">
      {text}
    </span>
  ) : null;

const RoundButton = ({
  children,
  onClick,
  label,
  active,
}: {
  children: JSX.Element;
  onClick: () => void;
  label: string;
  active?: boolean;
}): JSX.Element => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow-lg ring-2 transition hover:brightness-105 active:scale-95 ${active ? 'ring-white' : 'ring-gold-light/50'}`}
  >
    {children}
  </button>
);

export const GamePage = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { data: profileData } = useMyProfile();
  const [score, setScore] = useState<GameScore>(emptyScore);
  const [resetKey, setResetKey] = useState(0);

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [meBubble, setMeBubble] = useState<string | null>(null);
  const [oppBubble, setOppBubble] = useState<string | null>(null);
  const idRef = useRef(0);
  const timers = useRef<number[]>([]);

  // Menu: popup → settings / leave
  const [menuView, setMenuView] = useState<'none' | 'menu' | 'settings' | 'leave'>('none');

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const location = useLocation();
  const aiState = (location.state ?? {}) as { ai?: boolean; difficulty?: Difficulty };
  const ai = aiState.ai ? { difficulty: aiState.difficulty ?? 'medium' } : null;

  const profile = profileData?.profile;
  const myName = profile?.displayName ?? user?.username ?? 'You';
  const myLevel = profile?.level ?? 1;
  const oppName = ai ? 'Computer' : 'Guest_868891663';

  const reset = (): void => {
    setScore(emptyScore);
    setResetKey((k) => k + 1);
  };

  const push = (from: 'me' | 'opponent', text: string, kind: ChatKind): void => {
    idRef.current += 1;
    const id = idRef.current;
    setMessages((m) => [...m, { id, from, text, kind }].slice(-30));
  };

  const send = (text: string, kind: ChatKind): void => {
    push('me', text, kind);
    setMeBubble(text);
    timers.current.push(window.setTimeout(() => setMeBubble(null), 4000));
    // Simulated opponent reply (no realtime backend yet).
    timers.current.push(
      window.setTimeout(() => {
        const r = randomReply(idRef.current + text.length);
        push('opponent', r.text, r.kind);
        setOppBubble(r.text);
        timers.current.push(window.setTimeout(() => setOppBubble(null), 4000));
      }, 1400),
    );
  };

  const tip = score.cleared
    ? score.winner === 0
      ? '🎉 Player 1 wins!'
      : '🎉 Player 2 wins!'
    : score.queenStatus === 'PENDING_COVER'
      ? '👑 Cover the Queen! Pocket your coin'
      : 'Pot all your pucks to win the match';
  const turnMsg = score.thinking
    ? 'Computer is thinking…'
    : score.currentPlayer === 0
      ? 'Your turn'
      : ai
        ? "Computer's turn"
        : 'Player 2 — your turn';

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center px-3 py-3"
      style={{
        background: 'radial-gradient(ellipse at 50% 28%, #8a2f9e 0%, #5a1d6b 45%, #2e0e3a 100%)',
      }}
    >
      {/* Players + pot */}
      <div className="flex w-full max-w-xl items-start justify-between gap-2">
        <div
          className={`flex flex-col items-center rounded-2xl p-1 transition ${score.currentPlayer === 0 ? 'ring-2 ring-lime-400' : ''}`}
        >
          <Avatar name={myName} size={56} level={myLevel} className="!rounded-xl border-[3px]" />
          <span className="mt-1 max-w-[7rem] truncate text-[11px] font-semibold text-white/85">
            {myName}
          </span>
          <Bubble text={meBubble} />
        </div>

        <div className="flex flex-1 flex-col items-center pt-1">
          <span className="flex items-center gap-1.5 font-display text-2xl font-extrabold text-white drop-shadow">
            <Coins size={20} className="text-gold-light" /> {POT}
          </span>
          <span className="mt-1 rounded-lg bg-black/55 px-3 py-1.5 text-center text-sm font-semibold text-white shadow">
            {tip}
          </span>
        </div>

        <div
          className={`flex flex-col items-center rounded-2xl p-1 transition ${score.currentPlayer === 1 ? 'ring-2 ring-lime-400' : ''}`}
        >
          <Avatar name={oppName} size={56} level={20} className="!rounded-xl border-[3px]" />
          <span className="mt-1 max-w-[7rem] truncate text-[11px] font-semibold text-white/85">
            {oppName}
          </span>
          <Bubble text={oppBubble} />
        </div>
      </div>

      {/* Score */}
      <div className="mt-2 flex w-full max-w-xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-white">{score.black}</span>
          <Puck color="#2b2f38" ring="#0a0a0a" />
        </div>
        <div className="flex items-center gap-2">
          <Puck color="#29a3e6" ring="#0d6fb0" />
          <span className="font-display text-2xl font-bold text-white">{score.white}</span>
        </div>
      </div>

      {/* Board */}
      <div className="mt-3 w-full">
        <GameCanvas key={resetKey} onScore={setScore} ai={ai} />
      </div>

      {/* Bottom controls */}
      <div className="mt-4 flex w-full max-w-xl items-center justify-between gap-3">
        <RoundButton label="Chat" onClick={() => setChatOpen((o) => !o)} active={chatOpen}>
          <MessageCircle size={24} />
        </RoundButton>

        {score.cleared ? (
          <button
            onClick={reset}
            className="rounded-xl bg-gradient-to-b from-lime-400 to-green-600 px-6 py-3 font-display text-base font-bold text-white shadow-lg ring-1 ring-black/20 transition hover:brightness-105 active:scale-95"
          >
            Play again
          </button>
        ) : (
          <span className="rounded-xl bg-black/55 px-5 py-3 text-center font-display text-base font-bold text-white shadow">
            {turnMsg}
          </span>
        )}

        <RoundButton
          label="Menu"
          onClick={() => setMenuView((v) => (v === 'menu' ? 'none' : 'menu'))}
          active={menuView !== 'none'}
        >
          <Menu size={24} />
        </RoundButton>
      </div>

      <GameChat
        open={chatOpen}
        messages={messages}
        onSend={send}
        onClose={() => setChatOpen(false)}
      />

      {menuView === 'menu' && (
        <GameMenu
          onOptions={() => setMenuView('settings')}
          onLeave={() => setMenuView('leave')}
          onClose={() => setMenuView('none')}
        />
      )}
      {menuView === 'settings' && <GameSettingsModal onClose={() => setMenuView('none')} />}
      {menuView === 'leave' && (
        <LeaveMatchModal
          onLeave={() => navigate(ROUTES.LOBBY)}
          onKeepPlaying={() => setMenuView('none')}
        />
      )}
    </div>
  );
};

export default GamePage;
