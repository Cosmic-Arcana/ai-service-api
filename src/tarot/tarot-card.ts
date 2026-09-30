export const TAROT_SUITS = ['wands', 'cups', 'swords', 'pentacles'] as const;

export type TarotSuit = (typeof TAROT_SUITS)[number];

export type TarotElement = 'fire' | 'water' | 'air' | 'earth';

interface TarotCardBase {
  id: string;
  name: string;
  number: number;
  keywords: readonly string[];
  upright: string;
  reversed: string;
}

export interface MajorArcanaCard extends TarotCardBase {
  arcana: 'major';
  astrology: string;
}

export interface MinorArcanaCard extends TarotCardBase {
  arcana: 'minor';
  suit: TarotSuit;
  element: TarotElement;
}

export type TarotCard = MajorArcanaCard | MinorArcanaCard;

export const toCardId = (name: string): string => name.toLowerCase().replace(/\s+/g, '-');
