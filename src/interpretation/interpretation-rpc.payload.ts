import { RpcException } from '@nestjs/microservices';
import { isMessageEnvelope } from '../common/messaging/message-envelope';
import type { DrawnCardView } from '../tarot/contracts/draw-cards.contract';
import type { CosmicMotif, InterpretReadingPayload } from './interpretation.contract';

const reject = (message: string): never => {
  throw new RpcException({ code: 'invalid_payload', message });
};

const asRecord = (value: unknown, what: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    reject(`${what} must be an object`);
  }
  return value as Record<string, unknown>;
};

const requiredString = (data: Record<string, unknown>, key: string, what: string): string => {
  const value = data[key];
  if (typeof value !== 'string' || value.trim() === '') {
    reject(`${what}${key} must be a non-empty string`);
  }
  return value as string;
};

const parseCard = (value: unknown, index: number): DrawnCardView => {
  const where = `cards[${index}].`;
  const card = asRecord(value, `cards[${index}]`);
  if (typeof card.reversed !== 'boolean') {
    reject(`${where}reversed must be a boolean`);
  }
  const keywords = Array.isArray(card.keywords) ? card.keywords : [];
  return {
    positionKey: requiredString(card, 'positionKey', where),
    positionLabel: requiredString(card, 'positionLabel', where),
    cardId: requiredString(card, 'cardId', where),
    cardName: requiredString(card, 'cardName', where),
    reversed: card.reversed as boolean,
    keywords: keywords.filter((word): word is string => typeof word === 'string'),
    meaning: requiredString(card, 'meaning', where),
  };
};

const parseCosmic = (value: unknown): CosmicMotif | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const cosmic = asRecord(value, 'cosmic');
  return {
    motif: requiredString(cosmic, 'motif', 'cosmic.'),
    source: requiredString(cosmic, 'source', 'cosmic.'),
  };
};

export const parseInterpretReadingPayload = (value: unknown): InterpretReadingPayload => {
  if (!isMessageEnvelope(value)) {
    reject('message must be a MessageEnvelope');
  }
  const data = asRecord((value as { data: unknown }).data, 'payload data');
  if (!Array.isArray(data.cards)) {
    reject('cards must be an array');
  }
  return {
    question: requiredString(data, 'question', ''),
    cards: (data.cards as unknown[]).map(parseCard),
    cosmic: parseCosmic(data.cosmic),
  };
};
