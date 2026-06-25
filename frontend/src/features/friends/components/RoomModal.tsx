import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check, Play, LogOut, Users, Crown } from 'lucide-react';

import { Avatar, ActionPill } from '@shared/components';
import { ROUTES } from '@app/config/routes.constants';
import type { Room } from '../services/rooms.api';
import { useRoom, useLeaveRoom } from '../hooks/useRooms';

interface RoomModalProps {
  /** The room as created/joined (initial snapshot). */
  room: Room;
  /** Whether the current user is the host (can start). */
  isHost: boolean;
  onClose: () => void;
}

export const RoomModal = ({ room, isHost, onClose }: RoomModalProps): JSX.Element => {
  const navigate = useNavigate();
  const { data } = useRoom(room.code);
  const leave = useLeaveRoom();
  const [copied, setCopied] = useState(false);

  const current = data?.room ?? room;
  const members = current.members;
  const full = members.length >= current.maxPlayers;

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
          <p className="mt-2 text-xs text-felt/55">
            Friends enter this code in “Join Room” to play with you.
          </p>
        </div>

        {/* Members */}
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

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <ActionPill
            tone="red"
            icon={<LogOut size={16} />}
            onClick={handleLeave}
            className="w-full"
          >
            Leave
          </ActionPill>
          {isHost ? (
            <ActionPill
              tone="green"
              icon={<Play size={16} fill="currentColor" />}
              onClick={() => navigate(ROUTES.PRACTICE)}
              disabled={members.length < 2}
              className="w-full"
            >
              Start
            </ActionPill>
          ) : (
            <span className="flex items-center justify-center rounded-xl bg-black/20 py-2.5 text-sm font-semibold text-felt/60">
              {full ? 'Ready — waiting for host' : 'Waiting for host…'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
