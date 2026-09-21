import { MAJOR_ARCANA } from './major-arcana';
import { MINOR_ARCANA } from './minor-arcana';
import type { TarotCard } from './tarot-card';

/**
 * The order is part of the draw contract: a seed maps to deck positions, so reordering this
 * array silently changes which cards every existing seed produces.
 */
export const TAROT_DECK: readonly TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

const CARDS_BY_ID = new Map(TAROT_DECK.map((card) => [card.id, card]));

export const findTarotCard = (id: string): TarotCard | undefined => CARDS_BY_ID.get(id);
