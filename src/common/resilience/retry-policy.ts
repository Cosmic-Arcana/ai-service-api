import { Logger } from '@nestjs/common';
import { MonoTypeOperatorFunction, retry, throwError, timeout, timer, pipe } from 'rxjs';
import type { RetryConfig } from '../../config/configuration';

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRYABLE_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EPIPE',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EAI_AGAIN',
]);

/**
 * A 4xx other than the throttling codes means the request itself is wrong, so replaying it
 * only wastes budget. Everything transport-shaped is worth another attempt.
 */
export const isRetryableError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { code?: string; status?: number; response?: { status?: number }; name?: string };

  if (candidate.name === 'TimeoutError') {
    return true;
  }
  if (candidate.code && RETRYABLE_ERROR_CODES.has(candidate.code)) {
    return true;
  }

  const status = candidate.response?.status ?? candidate.status;
  if (typeof status === 'number') {
    return RETRYABLE_STATUS_CODES.has(status);
  }

  return false;
};

/** Full jitter: spreads retries of simultaneously-failing callers instead of synchronising them. */
export const computeBackoffDelay = (attempt: number, config: RetryConfig): number => {
  const exponential = config.initialDelayMs * config.backoffMultiplier ** (attempt - 1);
  const capped = Math.min(exponential, config.maxDelayMs);
  const jitter = capped * config.jitterRatio * Math.random();
  return Math.round(capped - capped * config.jitterRatio + jitter);
};

export interface RetryPolicyContext {
  operation: string;
  logger: Logger;
}

export const withRetryPolicy = <T>(
  config: RetryConfig,
  { operation, logger }: RetryPolicyContext,
): MonoTypeOperatorFunction<T> =>
  pipe(
    timeout({ each: config.timeoutMs }),
    retry<T>({
      count: config.maxAttempts - 1,
      delay: (error: unknown, retryCount: number) => {
        if (!isRetryableError(error)) {
          return throwError(() => error);
        }

        const delayMs = computeBackoffDelay(retryCount, config);
        logger.warn('outbound call failed, retrying', {
          operation,
          attempt: retryCount,
          maxAttempts: config.maxAttempts,
          delayMs,
          errorName: (error as Error).name,
          errorMessage: (error as Error).message,
        });
        return timer(delayMs);
      },
    }),
  );
