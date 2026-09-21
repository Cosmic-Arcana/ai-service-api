import { SeededRandom } from './seeded-random';
import type { TarotCard } from './tarot-card';
import { TAROT_DECK } from './tarot-deck';
import type { SpreadPosition, TarotSpread } from './tarot-spread';

export interface DrawnCard {
  position: SpreadPosition;
  card: TarotCard;
  reversed: boolean;
}

export const drawCards = (spread: TarotSpread, seed: string): DrawnCard[] => {
  const random = new SeededRandom(seed);
  const remaining = [...TAROT_DECK];

  return spread.positions.map((position) => {
    const [card] = remaining.splice(random.nextInt(remaining.length), 1);

    return { position, card, reversed: random.nextBoolean() };
  });
};
