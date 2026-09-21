import type { TarotCard } from '../tarot-card';

export interface GetTarotCardPayload {
  cardId: string;
}

export interface GetTarotCardResult {
  card: TarotCard | null;
}
