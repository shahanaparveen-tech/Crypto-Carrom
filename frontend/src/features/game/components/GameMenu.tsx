import { Settings, LogOut } from 'lucide-react';

interface GameMenuProps {
  onOptions: () => void;
  onLeave: () => void;
  onClose: () => void;
}

/** Small popup above the in-game menu button. */
export const GameMenu = ({ onOptions, onLeave, onClose }: GameMenuProps): JSX.Element => (
  <>
    {/* click-away backdrop */}
    <div className="fixed inset-0 z-40" onClick={onClose} />

    <div className="fixed bottom-24 right-3 z-50 flex w-44 flex-col gap-2 rounded-2xl border border-gold/30 bg-maroon-dark/95 p-2 shadow-panel backdrop-blur">
      <button
        onClick={onOptions}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-gold-light to-gold-dark px-4 py-2.5 font-display font-bold text-maroon-dark shadow transition hover:brightness-105 active:scale-95"
      >
        <Settings size={18} /> Options
      </button>
      <button
        onClick={onLeave}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-rose-500 to-red-700 px-4 py-2.5 font-display font-bold text-white shadow transition hover:brightness-110 active:scale-95"
      >
        <LogOut size={18} /> Leave
      </button>
    </div>
  </>
);
