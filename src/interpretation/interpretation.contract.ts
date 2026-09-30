import type { DrawnCardView } from '../tarot/contracts/draw-cards.contract';

/** Symbolic colour attached to an already drawn reading. It never takes part in the draw. */
export interface CosmicMotif {
  motif: string;
  source: string;
}

export interface InterpretReadingPayload {
  question: string;
  cards: DrawnCardView[];
  cosmic: CosmicMotif | null;
}

export interface InterpretReadingResult {
  text: string;
  cards: DrawnCardView[];
  interpreter: string;
}
