import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type {
  InterpretationRequest,
  InterpretationResult,
  ReadingInterpreterPort,
} from './reading-interpreter.port';
const TONES = ['steady', 'restless', 'quiet', 'bright'] as const;

/**
 * Deterministic stand-in for the model, selected with `AI_INTERPRETER=stub`. It exists so the whole
 * flow — draw, interpretation, saved reading — can be run and asserted on without a billed,
 * non-repeatable call. It is the default: a developer with no key still gets a complete flow.
 */
@Injectable()
export class StubReadingAdapter implements ReadingInterpreterPort {
  interpret(request: InterpretationRequest): Promise<InterpretationResult> {
    const tone = TONES[createHash('sha256').update(request.question).digest()[0] % TONES.length];
    const lines = [
      // The question opens the reading, so two different questions never read the same way.
      `You asked: ${request.question.trim()}`,
      ...request.cards.map(
        (card) =>
          `${card.positionKey}: ${card.cardName}${card.reversed ? ' (reversed)' : ''} reads ${tone}.`,
      ),
    ];

    return Promise.resolve({ interpretation: lines.join('\n'), fictional: true });
  }
}
