import { RpcException } from '@nestjs/microservices';
import { isMessageEnvelope, type MessageEnvelope } from '../common/messaging/message-envelope';
import { SHUFFLE_OPTIONS, type DrawCardsPayload } from './contracts/draw-cards.contract';
import type { GetTarotCardPayload } from './contracts/tarot-card.contract';
import { TAROT_SPREADS, type SpreadId } from './tarot-spread';

const reject = (message: string): never => {
  throw new RpcException({ code: 'invalid_payload', message });
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    reject('payload data must be an object');
  }
  return value as Record<string, unknown>;
};

const requiredString = (data: Record<string, unknown>, key: string): string => {
  const value = data[key];
  if (typeof value !== 'string' || value.trim() === '') {
    reject(`${key} must be a non-empty string`);
  }
  return value as string;
};

export const unwrapEnvelope = (value: unknown): MessageEnvelope => {
  if (!isMessageEnvelope(value)) {
    reject('message must be a MessageEnvelope');
  }
  return value as MessageEnvelope;
};

export const parseDrawCardsPayload = (value: unknown): DrawCardsPayload => {
  const envelope = unwrapEnvelope(value);
  const data = asRecord(envelope.data);
  const spreadId = requiredString(data, 'spreadId');
  if (!(spreadId in TAROT_SPREADS)) {
    reject('spreadId is not a known spread');
  }
  const askedAt = requiredString(data, 'askedAt');
  if (Number.isNaN(Date.parse(askedAt))) {
    reject('askedAt must be an ISO 8601 timestamp');
  }
  let shuffle: DrawCardsPayload['shuffle'];
  if (data.shuffle !== undefined) {
    if (
      typeof data.shuffle !== 'string' ||
      !(SHUFFLE_OPTIONS as readonly string[]).includes(data.shuffle)
    ) {
      reject('shuffle is not a known option');
    }
    shuffle = data.shuffle as DrawCardsPayload['shuffle'];
  }
  return {
    userId: requiredString(data, 'userId'),
    question: requiredString(data, 'question'),
    spreadId: spreadId as SpreadId,
    askedAt,
    shuffle,
  };
};

export const parseGetTarotCardPayload = (value: unknown): GetTarotCardPayload => {
  const envelope = unwrapEnvelope(value);
  const data = asRecord(envelope.data);
  return { cardId: requiredString(data, 'cardId') };
};
