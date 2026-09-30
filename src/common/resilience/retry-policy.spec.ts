import { computeBackoffDelay, isRetryableError } from './retry-policy';
import type { RetryConfig } from '../../config/configuration';

const config: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 1_000,
  backoffMultiplier: 2,
  jitterRatio: 0.5,
  timeoutMs: 5_000,
};

describe('isRetryableError', () => {
  it.each([
    ['ECONNREFUSED', { code: 'ECONNREFUSED' }],
    ['ETIMEDOUT', { code: 'ETIMEDOUT' }],
    ['rxjs timeout', { name: 'TimeoutError' }],
    ['429 throttling', { response: { status: 429 } }],
    ['503 upstream', { response: { status: 503 } }],
  ])('treats %s as retryable', (_label, error) => {
    expect(isRetryableError(error)).toBe(true);
  });

  it.each([
    ['400 bad request', { response: { status: 400 } }],
    ['401 unauthorized', { response: { status: 401 } }],
    ['404 not found', { response: { status: 404 } }],
    ['422 unprocessable', { response: { status: 422 } }],
  ])('does not retry %s', (_label, error) => {
    expect(isRetryableError(error)).toBe(false);
  });

  it('does not retry non-object errors', () => {
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError('boom')).toBe(false);
  });
});

describe('computeBackoffDelay', () => {
  it('grows exponentially across attempts', () => {
    const noJitter: RetryConfig = { ...config, jitterRatio: 0 };

    expect(computeBackoffDelay(1, noJitter)).toBe(100);
    expect(computeBackoffDelay(2, noJitter)).toBe(200);
    expect(computeBackoffDelay(3, noJitter)).toBe(400);
  });

  it('never exceeds maxDelayMs', () => {
    const noJitter: RetryConfig = { ...config, jitterRatio: 0 };

    expect(computeBackoffDelay(10, noJitter)).toBe(config.maxDelayMs);
  });

  it('keeps jittered delays inside the expected band', () => {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      for (let sample = 0; sample < 50; sample += 1) {
        const delay = computeBackoffDelay(attempt, config);
        const ceiling = Math.min(config.initialDelayMs * 2 ** (attempt - 1), config.maxDelayMs);

        expect(delay).toBeGreaterThanOrEqual(Math.round(ceiling * (1 - config.jitterRatio)) - 1);
        expect(delay).toBeLessThanOrEqual(ceiling);
      }
    }
  });
});
