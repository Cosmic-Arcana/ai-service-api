import { createHash } from 'node:crypto';
import type { SpreadId } from './tarot-spread';

export const GOLDEN_SEED = 'golden-seed';

export interface DrawSeedInput {
  userId: string;
  question: string;
  spreadId: SpreadId;
  askedAt: Date;
}

const normalizeQuestion = (question: string): string =>
  question.trim().toLowerCase().replace(/\s+/g, ' ');

const toUtcDay = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * The same user asking the same question with the same spread on the same UTC day gets the same
 * cards: a retried command replays its draw, and re-asking does not reshuffle fate.
 */
export const createDrawSeed = ({ userId, question, spreadId, askedAt }: DrawSeedInput): string =>
  createHash('sha256')
    .update(JSON.stringify([userId, normalizeQuestion(question), spreadId, toUtcDay(askedAt)]))
    .digest('hex');
