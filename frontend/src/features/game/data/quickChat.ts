export type ChatKind = 'text' | 'emoji';

export interface ChatMessage {
  id: number;
  from: 'me' | 'opponent';
  text: string;
  kind: ChatKind;
}

/** Tap-to-send preset phrases. */
export const QUICK_PHRASES: string[] = [
  'Hi! 👋',
  'Good luck!',
  'Nice shot!',
  'Well played!',
  'Oops!',
  'Hurry up! ⏳',
  'Good game!',
  'Thank you!',
  'Sorry!',
  "Let's go! 🔥",
];

/** Tap-to-send emojis / reactions. */
export const QUICK_EMOJIS: string[] = [
  '😀',
  '😂',
  '😎',
  '😮',
  '😢',
  '😡',
  '👍',
  '👏',
  '🔥',
  '🎯',
  '🍀',
  '😴',
];

/** A random opponent reply, used while there's no realtime backend. */
export const randomReply = (seed: number): { text: string; kind: ChatKind } => {
  const useEmoji = seed % 2 === 0;
  if (useEmoji) {
    const e = QUICK_EMOJIS[seed % QUICK_EMOJIS.length]!;
    return { text: e, kind: 'emoji' };
  }
  const p = QUICK_PHRASES[seed % QUICK_PHRASES.length]!;
  return { text: p, kind: 'text' };
};
