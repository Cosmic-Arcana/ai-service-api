import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { DrawnCardView } from '../tarot/contracts/draw-cards.contract';
import type { InterpretReadingPayload } from './interpretation.contract';
import { InterpreterPort } from './interpreter.port';

/**
 * Deterministic stand-in for the model. It exists so the whole flow — draw, cosmic colour,
 * interpretation, saved reading — can be run and asserted on without a billed, non-repeatable call.
 * The Anthropic adapter replaces this class and nothing else.
 */
@Injectable()
export class StubInterpreter implements InterpreterPort {
  readonly name = 'stub';

  interpret(payload: InterpretReadingPayload): Promise<string> {
    const tone = TONES[digitOf(payload.question, TONES.length)];

    // The question opens the reading: two different questions must never read the same way, and a
    // tone drawn from a short list would collide.
    const lines = [
      `You asked: ${payload.question.trim()}`,
      ...payload.cards.map((card) => `${card.positionLabel}: ${sentenceFor(card, tone)}`),
    ];

    if (payload.cosmic) {
      lines.push(`Overhead, ${payload.cosmic.motif} — colour for the reading, not a cause of it.`);
    }

    return Promise.resolve(lines.join('\n'));
  }
}

const TONES = ['steady', 'restless', 'quiet', 'bright'] as const;

const digitOf = (value: string, modulo: number): number =>
  createHash('sha256').update(value).digest()[0] % modulo;

const sentenceFor = (card: DrawnCardView, tone: string): string => {
  const orientation = card.reversed ? 'reversed, so it works against the grain' : 'upright';
  return `${card.cardName} (${orientation}) reads ${tone} — ${card.meaning}.`;
};
