import { ConfigService } from '@nestjs/config';
import { fingerprintOf, IdempotencyStore } from './idempotency-store.service';

const buildStore = (overrides: Partial<Record<string, number>> = {}): IdempotencyStore => {
  const config = {
    getOrThrow: () => ({
      ttlMs: 60_000,
      sweepIntervalMs: 60_000,
      maxEntries: 3,
      ...overrides,
    }),
  } as unknown as ConfigService;

  return new IdempotencyStore(config);
};

describe('IdempotencyStore', () => {
  const fingerprint = fingerprintOf({ question: 'will it rain' });

  it('reserves a free key', () => {
    const store = buildStore();

    expect(store.reserve('key-1', fingerprint)).toEqual({ reserved: true });
  });

  it('refuses a second reservation of the same key', () => {
    const store = buildStore();
    store.reserve('key-1', fingerprint);

    const result = store.reserve('key-1', fingerprint);

    expect(result.reserved).toBe(false);
    expect(result.reserved === false && result.existing.state).toBe('in_flight');
  });

  it('surfaces the completed record with its cached body for replay', () => {
    const store = buildStore();
    store.reserve('key-1', fingerprint);
    store.complete('key-1', 201, { reading: 'the tower' });

    const result = store.reserve('key-1', fingerprint);

    expect(result.reserved).toBe(false);
    if (result.reserved === false && result.existing.state === 'completed') {
      expect(result.existing.statusCode).toBe(201);
      expect(result.existing.body).toEqual({ reading: 'the tower' });
    } else {
      throw new Error('expected a completed record');
    }
  });

  it('reports a differing fingerprint so the caller can reject key reuse', () => {
    const store = buildStore();
    store.reserve('key-1', fingerprint);

    const result = store.reserve('key-1', fingerprintOf({ question: 'different' }));

    expect(result.reserved).toBe(false);
    expect(result.reserved === false && result.existing.fingerprint).toBe(fingerprint);
  });

  it('frees the key after release so a failed call can be retried', () => {
    const store = buildStore();
    store.reserve('key-1', fingerprint);
    store.release('key-1');

    expect(store.reserve('key-1', fingerprint)).toEqual({ reserved: true });
  });

  it('expires records once the ttl has passed', () => {
    jest.useFakeTimers();
    const store = buildStore({ ttlMs: 1_000 });
    store.reserve('key-1', fingerprint);

    jest.advanceTimersByTime(1_001);

    expect(store.get('key-1')).toBeUndefined();
    jest.useRealTimers();
  });

  it('evicts the oldest entry once maxEntries is reached', () => {
    const store = buildStore({ maxEntries: 2 });
    store.reserve('key-1', fingerprint);
    store.reserve('key-2', fingerprint);

    store.reserve('key-3', fingerprint);

    expect(store.get('key-1')).toBeUndefined();
    expect(store.get('key-3')).toBeDefined();
  });

  it('produces a stable fingerprint for identical payloads', () => {
    expect(fingerprintOf({ a: 1 })).toBe(fingerprintOf({ a: 1 }));
    expect(fingerprintOf({ a: 1 })).not.toBe(fingerprintOf({ a: 2 }));
  });
});
