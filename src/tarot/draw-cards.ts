import { SeededRandom } from './seeded-random';
import { shuffle, ShuffleAlgorithm } from './shuffle-algorithms';
import type { TarotCard } from './tarot-card';
import { TAROT_DECK } from './tarot-deck';
import type { SpreadPosition, TarotSpread } from './tarot-spread';

export interface DrawnCard {
  position: SpreadPosition;
  card: TarotCard;
  reversed: boolean;
}

export const drawCards = (
  spread: TarotSpread,
  seed: string,
  algorithm: ShuffleAlgorithm,
): DrawnCard[] => {
  const random = new SeededRandom(seed);
  const deck = shuffle(TAROT_DECK, algorithm, random);

  return spread.positions.map((position, index) => ({
    position,
    card: deck[index],
    reversed: random.nextBoolean(),
  }));
};
