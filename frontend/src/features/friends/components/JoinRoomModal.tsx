import { useState } from 'react';
import { X, LogIn } from 'lucide-react';

import { ActionPill } from '@shared/components';
import { getApiErrorMessage } from '@shared/services/http';
import type { Room } from '../services/rooms.api';
import { useJoinRoom } from '../hooks/useRooms';

interface JoinRoomModalProps {
  onJoined: (room: Room) => void;
  onClose: () => void;
}

export const JoinRoomModal = ({ onJoined, onClose }: JoinRoomModalProps): JSX.Element => {
  const join = useJoinRoom();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (): void => {
    const value = code.trim().toUpperCase();
    if (value.length < 4) {
      setError('Enter a valid room code');
      return;
    }
    setError(null);
    join.mutate(value, {
      onSuccess: (res) => onJoined(res.room),
      onError: (err) => setError(getApiErrorMessage(err, 'Could not join room')),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-wood-light to-wood-dark p-5 shadow-panel"
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
          Join Room
        </h2>
        <p className="mt-1 text-center text-sm text-felt/60">Paste the code your friend shared.</p>

        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="ENTER CODE"
          maxLength={8}
          className="mt-4 w-full rounded-xl border border-gold/30 bg-maroon-dark/70 px-4 py-3 text-center font-display text-2xl font-bold tracking-[0.3em] text-felt outline-none placeholder:text-felt/30 focus:ring-2 focus:ring-gold/50"
        />

        {error && <p className="mt-2 text-center text-sm text-rose-300">{error}</p>}

        <ActionPill
          tone="green"
          icon={<LogIn size={16} />}
          onClick={submit}
          disabled={join.isPending}
          className="mt-4 w-full"
        >
          {join.isPending ? 'Joining…' : 'Join Room'}
        </ActionPill>
      </div>
    </div>
  );
};
