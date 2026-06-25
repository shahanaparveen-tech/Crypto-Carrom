import { X } from 'lucide-react';

interface GameModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Wood-framed in-game dialog (Carrom-Pool style). */
export const GameModal = ({ title, onClose, children, footer }: GameModalProps): JSX.Element => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-md rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-wood-light to-wood-dark p-4 shadow-panel"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-rose-500 to-red-700 text-white shadow-lg ring-2 ring-white/40 transition hover:brightness-110 active:scale-95"
      >
        <X size={18} strokeWidth={3} />
      </button>

      <h2 className="mb-3 text-center font-display text-2xl font-extrabold text-gold-light text-shadow-deep">
        {title}
      </h2>

      <div className="rounded-2xl bg-black/15 p-4 ring-1 ring-black/20">{children}</div>

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  </div>
);
