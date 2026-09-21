import type {
  DrawCardsPayload,
  DrawCardsResult,
  DrawnCardView,
  ShuffleOption,
} from './contracts/draw-cards.contract';
import type { GetTarotCardPayload, GetTarotCardResult } from './contracts/tarot-card.contract';
import { drawCards, DrawnCard } from './draw-cards';
import { createDrawSeed, GOLDEN_SEED } from './draw-seed';
import { findTarotCard } from './tarot-deck';
import { TAROT_SPREADS } from './tarot-spread';

const DEFAULT_SHUFFLE: ShuffleOption = 'fisher-yates';

const toView = ({ position, card, reversed }: DrawnCard): DrawnCardView => ({
  positionKey: position.key,
  positionLabel: position.label,
  cardId: card.id,
  cardName: card.name,
  reversed,
  keywords: card.keywords,
  meaning: reversed ? card.reversed : card.upright,
});

export const drawReading = (payload: DrawCardsPayload): DrawCardsResult => {
  const shuffle = payload.shuffle ?? DEFAULT_SHUFFLE;
  const isGolden = shuffle === 'golden-seed';
  const seed = isGolden
    ? GOLDEN_SEED
    : createDrawSeed({
        userId: payload.userId,
        question: payload.question,
        spreadId: payload.spreadId,
        askedAt: new Date(payload.askedAt),
      });

  const drawn = drawCards(
    TAROT_SPREADS[payload.spreadId],
    seed,
    isGolden ? 'fisher-yates' : shuffle,
  );

  return { spreadId: payload.spreadId, shuffle, cards: drawn.map(toView) };
};

export const getTarotCard = ({ cardId }: GetTarotCardPayload): GetTarotCardResult => ({
  card: findTarotCard(cardId) ?? null,
});
