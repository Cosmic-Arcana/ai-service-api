export interface SpreadPosition {
  key: string;
  label: string;
  meaning: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  positions: readonly SpreadPosition[];
}

export const TAROT_SPREADS = {
  single: {
    id: 'single',
    name: 'Single card',
    positions: [
      {
        key: 'focus',
        label: 'Focus',
        meaning: 'The heart of the question.',
      },
    ],
  },
  'three-card': {
    id: 'three-card',
    name: 'Past, present, future',
    positions: [
      {
        key: 'past',
        label: 'Past',
        meaning: 'What led to this moment.',
      },
      {
        key: 'present',
        label: 'Present',
        meaning: 'Where things stand now.',
      },
      {
        key: 'future',
        label: 'Future',
        meaning: 'Where the current path is heading.',
      },
    ],
  },
} as const satisfies Record<string, TarotSpread>;

export type SpreadId = keyof typeof TAROT_SPREADS;
