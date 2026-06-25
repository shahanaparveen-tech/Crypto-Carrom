import { useEffect, useRef, useState } from 'react';
import { X, Send, Smile, MessageSquareText } from 'lucide-react';

import { cn } from '@shared/utils/cn';
import { QUICK_PHRASES, QUICK_EMOJIS, type ChatMessage, type ChatKind } from '../data/quickChat';

interface GameChatProps {
  open: boolean;
  messages: ChatMessage[];
  onSend: (text: string, kind: ChatKind) => void;
  onClose: () => void;
}

type Tab = 'phrases' | 'emojis';

export const GameChat = ({
  open,
  messages,
  onSend,
  onClose,
}: GameChatProps): JSX.Element | null => {
  const [tab, setTab] = useState<Tab>('phrases');
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  if (!open) return null;

  const submit = (): void => {
    const text = draft.trim();
    if (!text) return;
    onSend(text, 'text');
    setDraft('');
  };

  return (
    <div className="fixed bottom-24 left-3 z-50 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col rounded-2xl border border-gold/30 bg-maroon-dark/95 shadow-panel backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 px-4 py-2.5">
        <span className="font-display text-sm font-bold text-gold-light">Quick Chat</span>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-felt/60 transition hover:text-felt"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="max-h-48 min-h-[5rem] space-y-2 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <p className="py-4 text-center text-xs text-felt/40">Say hello to your opponent 👋</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}
            >
              <span
                className={cn(
                  'max-w-[75%] rounded-2xl px-3 py-1.5 text-sm shadow',
                  m.kind === 'emoji' ? 'text-2xl' : '',
                  m.from === 'me'
                    ? 'rounded-br-sm bg-gold-gradient text-maroon-dark'
                    : 'rounded-bl-sm bg-wood text-felt',
                )}
              >
                {m.text}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Quick options */}
      <div className="border-t border-gold/15 px-3 py-2">
        <div className="mb-2 flex gap-1">
          <button
            onClick={() => setTab('phrases')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold transition',
              tab === 'phrases' ? 'bg-gold/20 text-gold-light' : 'text-felt/55 hover:text-felt',
            )}
          >
            <MessageSquareText size={14} /> Phrases
          </button>
          <button
            onClick={() => setTab('emojis')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold transition',
              tab === 'emojis' ? 'bg-gold/20 text-gold-light' : 'text-felt/55 hover:text-felt',
            )}
          >
            <Smile size={14} /> Emojis
          </button>
        </div>

        {tab === 'phrases' ? (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PHRASES.map((p) => (
              <button
                key={p}
                onClick={() => onSend(p, 'text')}
                className="rounded-full border border-gold/20 bg-maroon-light/40 px-3 py-1 text-xs text-felt transition hover:border-gold/50 hover:bg-maroon-light/70"
              >
                {p}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1">
            {QUICK_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => onSend(e, 'emoji')}
                className="rounded-lg py-1 text-xl transition hover:bg-white/10"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Free text */}
      <div className="flex items-center gap-2 border-t border-gold/15 px-3 py-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Type a message…"
          maxLength={120}
          className="flex-1 rounded-full border border-gold/20 bg-maroon-dark/70 px-3 py-1.5 text-sm text-felt outline-none placeholder:text-felt/40 focus:ring-2 focus:ring-gold/40"
        />
        <button
          onClick={submit}
          aria-label="Send message"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow transition hover:brightness-105 active:scale-95"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
