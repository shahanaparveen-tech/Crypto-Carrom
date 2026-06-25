import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check, Play, LogOut, Users, Crown, CheckCircle2 } from 'lucide-react';

import { Avatar, ActionPill } from '@shared/components';
import { matchRoute } from '@app/config/routes.constants';
import { useAuthState } from '@features/auth/hooks';
import type { Room } from '../services/rooms.api';
import { useRoom, useLeaveRoom } from '../hooks/useRooms';
import { useRoomMatch } from '../hooks/useRoomMatch';

interface RoomModalProps {
  room: Room;
  isHost: boolean;
  onClose: () => void;
}

export const RoomModal = ({ room, onClose }: RoomModalProps): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { data } = useRoom(room.code);
  const leave = useLeaveRoom();
  const [copied, setCopied] = useState(false);

  const current = data?.room ?? room;
  const members = current.members;
  const { ready, started, sendReady } = useRoomMatch(current.id);
  const myId = user?.id ?? '';
  const myReady = !!ready[myId];

  // When the match starts, every player is taken straight to the board.
  useEffect(() => {
    if (started) navigate(matchRoute(current.id));
  }, [started, current.id, navigate]);

  const nameOf = (userId: string): string => {
    const m = members.find((x) => x.userId === userId);
    return m?.displayName ?? m?.username ?? 'Player';
  };

  const copyCode = (): void => {
    void navigator.clipboard?.writeText(current.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleLeave = (): void => {
    leave.mutate(current.id, { onSettled: onClose });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-wood-light to-wood-dark p-5 shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-rose-500 to-red-700 text-white shadow-lg ring-2 ring-white/40"
        >
          <X size={18} strokeWidth={3} />
        </button>

        <h2 className="text-center font-display text-2xl font-extrabold text-gold-light text-shadow-deep">
          Private Room
        </h2>

        {/* Shareable code */}
        <div className="mt-4 rounded-2xl bg-black/20 p-4 text-center ring-1 ring-black/20">
          <p className="text-xs uppercase tracking-wide text-felt/60">Share this code</p>
          <div className="mt-1 flex items-center justify-center gap-3">
            <span className="font-display text-4xl font-extrabold tracking-[0.3em] text-felt">
              {current.code}
            </span>
            <button
              onClick={copyCode}
              aria-label="Copy code"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow ring-1 ring-black/25 transition hover:brightness-105 active:scale-95"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Members + ready state */}
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-felt/70">
            <Users size={15} /> Players · {members.length}/{current.maxPlayers}
          </p>
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center gap-3 rounded-xl bg-black/15 px-3 py-2"
              >
                <Avatar name={m.displayName ?? m.username} size={36} level={m.level} />
                <span className="flex-1 truncate font-display font-semibold text-felt">
                  {m.displayName ?? m.username}
                </span>
                {m.isHost && (
                  <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-gold-light">
                    <Crown size={11} /> Host
                  </span>
                )}
                {ready[m.userId] ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 size={14} /> Ready
                  </span>
                ) : (
                  <span className="text-xs text-felt/40">Not ready</span>
                )}
              </div>
            ))}
            {Array.from({ length: Math.max(0, current.maxPlayers - members.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-dashed border-gold/20 px-3 py-2 text-felt/40"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/20">
                    ·
                  </span>
                  <span className="text-sm">Waiting for player…</span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Started banner / actions */}
        {started ? (
          <div className="mt-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-center">
            <p className="font-display text-lg font-bold text-emerald-300">Match started!</p>
            <p className="mt-1 text-sm text-felt/80">
              {started.matchType.toUpperCase()} · {nameOf(started.turn.currentPlayer)} goes first
            </p>
            <ActionPill
              tone="green"
              icon={<Play size={16} fill="currentColor" />}
              className="mt-3 w-full"
              onClick={() => navigate(matchRoute(current.id))}
            >
              Enter Board
            </ActionPill>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <ActionPill
              tone="red"
              icon={<LogOut size={16} />}
              onClick={handleLeave}
              className="w-full"
            >
              Leave
            </ActionPill>
            <ActionPill
              tone={myReady ? 'gold' : 'green'}
              icon={myReady ? <CheckCircle2 size={16} /> : <Check size={16} />}
              onClick={() => sendReady(!myReady)}
              className="w-full"
            >
              {myReady ? 'Ready ✓' : 'Ready'}
            </ActionPill>
          </div>
        )}
        {!started && (
          <p className="mt-2 text-center text-xs text-felt/45">
            Match starts automatically when everyone is ready.
          </p>
        )}
      </div>
    </div>
  );
};
