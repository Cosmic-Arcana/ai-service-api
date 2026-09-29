import type { DrawCardsPayload, DrawCardsResult } from '../tarot/contracts/draw-cards.contract';
import { drawReading } from '../tarot/tarot-use-cases';
import type { InterpretationResult, ReadingInterpreterPort } from './reading-interpreter.port';

export interface PredictionResult {
  draw: DrawCardsResult;
  interpretation: InterpretationResult;
}

export const createPrediction = async (
  payload: DrawCardsPayload,
  interpreter: ReadingInterpreterPort,
): Promise<PredictionResult> => {
  const draw = drawReading(payload);
  const interpretation = await interpreter.interpret({
    question: payload.question,
    cards: draw.cards,
  });
  return { draw, interpretation };
};
