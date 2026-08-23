export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';
export const IDEMPOTENCY_REPLAYED_HEADER = 'idempotency-replayed';

const CORRELATION_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export const isValidCorrelationId = (value: unknown): value is string =>
  typeof value === 'string' && CORRELATION_ID_PATTERN.test(value);
