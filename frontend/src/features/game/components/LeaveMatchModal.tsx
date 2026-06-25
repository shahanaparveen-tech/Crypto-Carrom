import { GameModal } from './GameModal';

interface LeaveMatchModalProps {
  onLeave: () => void;
  onKeepPlaying: () => void;
}

export const LeaveMatchModal = ({ onLeave, onKeepPlaying }: LeaveMatchModalProps): JSX.Element => (
  <GameModal
    title="Leave Match"
    onClose={onKeepPlaying}
    footer={
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onLeave}
          className="rounded-xl bg-gradient-to-b from-rose-500 to-red-700 py-3 font-display text-lg font-bold text-white shadow-lg ring-1 ring-black/20 transition hover:brightness-110 active:scale-95"
        >
          Leave
        </button>
        <button
          onClick={onKeepPlaying}
          className="rounded-xl bg-gradient-to-b from-lime-400 to-green-600 py-3 font-display text-lg font-bold text-white shadow-lg ring-1 ring-black/20 transition hover:brightness-110 active:scale-95"
        >
          Keep Playing
        </button>
      </div>
    }
  >
    <p className="py-10 text-center font-display text-xl font-bold text-white">
      You will lose if you leave!
    </p>
  </GameModal>
);
