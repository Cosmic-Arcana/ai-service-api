import { SHUFFLE_ALGORITHMS } from '../shuffle-algorithms';
import type { SpreadId } from '../tarot-spread';

export const SHUFFLE_OPTIONS = [...SHUFFLE_ALGORITHMS, 'golden-seed'] as const;

export type ShuffleOption = (typeof SHUFFLE_OPTIONS)[number];

export interface DrawCardsPayload {
  userId: string;
  question: string;
  spreadId: SpreadId;
  /** Defaults to `fisher-yates`. `golden-seed` ignores user, question and day: everyone gets the same cards. */
  shuffle?: ShuffleOption;
  /** ISO 8601 moment the user asked, fixed by the caller so a retry after UTC midnight replays the same draw. */
  askedAt: string;
}

export interface DrawnCardView {
  positionKey: string;
  positionLabel: string;
  cardId: string;
  cardName: string;
  reversed: boolean;
  keywords: readonly string[];
  meaning: string;
}

export interface DrawCardsResult {
  spreadId: SpreadId;
  shuffle: ShuffleOption;
  cards: DrawnCardView[];
}
