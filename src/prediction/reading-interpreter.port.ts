import type { DrawnCardView } from '../tarot/contracts/draw-cards.contract';

export interface InterpretationRequest {
  question: string;
  cards: ReadonlyArray<Pick<DrawnCardView, 'positionKey' | 'cardId' | 'cardName' | 'reversed'>>;
}

export interface InterpretationResult {
  interpretation: string;
  fictional: true;
}

export const READING_INTERPRETER = Symbol('READING_INTERPRETER');

export interface ReadingInterpreterPort {
  interpret(request: InterpretationRequest): Promise<InterpretationResult>;
}
