import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import type { IdempotencyConfig } from '../../config/configuration';

export type IdempotencyRecord =
  | { state: 'in_flight'; fingerprint: string; startedAt: number }
  | {
      state: 'completed';
      fingerprint: string;
      startedAt: number;
      statusCode: number;
      body: unknown;
    };

interface StoredRecord {
  record: IdempotencyRecord;
  expiresAt: number;
}

export const fingerprintOf = (parts: unknown): string =>
  createHash('sha256')
    .update(JSON.stringify(parts ?? null))
    .digest('hex')
    .slice(0, 32);

/**
 * Deliberately in-process: there is no Redis yet, so idempotency guarantees hold per
 * instance only. Running more than one replica of a service breaks the guarantee.
 */
@Injectable()
export class IdempotencyStore implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(IdempotencyStore.name);
  private readonly records = new Map<string, StoredRecord>();
  private sweeper?: NodeJS.Timeout;
  private readonly config: IdempotencyConfig;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    this.config = configService.getOrThrow<IdempotencyConfig>('idempotency');
  }

  onModuleInit(): void {
    this.sweeper = setInterval(() => this.sweep(), this.config.sweepIntervalMs);
    this.sweeper.unref();
  }

  onApplicationShutdown(): void {
    if (this.sweeper) {
      clearInterval(this.sweeper);
      this.sweeper = undefined;
    }
    this.records.clear();
  }

  get(key: string): IdempotencyRecord | undefined {
    const stored = this.records.get(key);
    if (!stored) {
      return undefined;
    }
    if (stored.expiresAt <= Date.now()) {
      this.records.delete(key);
      return undefined;
    }
    return stored.record;
  }

  /**
   * Reserve-or-return in one step: concurrent duplicates must never both see an empty slot,
   * which is why this is not a get() followed by a set().
   */
  reserve(
    key: string,
    fingerprint: string,
  ): { reserved: true } | { reserved: false; existing: IdempotencyRecord } {
    const existing = this.get(key);
    if (existing) {
      return { reserved: false, existing };
    }

    this.evictIfFull();
    this.records.set(key, {
      record: { state: 'in_flight', fingerprint, startedAt: Date.now() },
      expiresAt: Date.now() + this.config.ttlMs,
    });
    return { reserved: true };
  }

  complete(key: string, statusCode: number, body: unknown): void {
    const stored = this.records.get(key);
    if (!stored) {
      return;
    }
    stored.record = {
      state: 'completed',
      fingerprint: stored.record.fingerprint,
      startedAt: stored.record.startedAt,
      statusCode,
      body,
    };
  }

  /** A failed attempt must not poison the key: the caller is entitled to retry it. */
  release(key: string): void {
    this.records.delete(key);
  }

  private evictIfFull(): void {
    if (this.records.size < this.config.maxEntries) {
      return;
    }
    const oldest = this.records.keys().next();
    if (!oldest.done) {
      this.records.delete(oldest.value);
      this.logger.warn('idempotency store full, evicted oldest entry', {
        context: IdempotencyStore.name,
        maxEntries: this.config.maxEntries,
      });
    }
  }

  private sweep(): void {
    const now = Date.now();
    let removed = 0;
    for (const [key, stored] of this.records) {
      if (stored.expiresAt <= now) {
        this.records.delete(key);
        removed += 1;
      }
    }
    if (removed > 0) {
      this.logger.debug('idempotency sweep completed', { removed, remaining: this.records.size });
    }
  }
}
