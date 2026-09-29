export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterRatio: number;
  timeoutMs: number;
}

export interface IdempotencyConfig {
  ttlMs: number;
  sweepIntervalMs: number;
  maxEntries: number;
}

export const AI_EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'] as const;

export type AiEffort = (typeof AI_EFFORT_LEVELS)[number];

export interface AppConfig {
  serviceName: string;
  nodeEnv: string;
  logLevel: string;
  http: { port: number };
  tcp: { host: string; port: number };
  nasaService: { host: string; port: number };
  anthropic: { model: string; effort: AiEffort; timeoutMs: number };
  retry: RetryConfig;
  idempotency: IdempotencyConfig;
  shutdownGraceMs: number;
}

export const configuration = (): AppConfig => ({
  serviceName: 'ai-service-api',
  nodeEnv: process.env.NODE_ENV as string,
  logLevel: process.env.LOG_LEVEL as string,
  http: { port: Number(process.env.HTTP_PORT) },
  tcp: { host: process.env.TCP_HOST as string, port: Number(process.env.TCP_PORT) },
  nasaService: {
    host: process.env.NASA_SERVICE_TCP_HOST as string,
    port: Number(process.env.NASA_SERVICE_TCP_PORT),
  },
  anthropic: {
    model: process.env.AI_MODEL as string,
    effort: process.env.AI_EFFORT as AiEffort,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS),
  },
  retry: {
    maxAttempts: Number(process.env.RETRY_MAX_ATTEMPTS),
    initialDelayMs: Number(process.env.RETRY_INITIAL_DELAY_MS),
    maxDelayMs: Number(process.env.RETRY_MAX_DELAY_MS),
    backoffMultiplier: Number(process.env.RETRY_BACKOFF_MULTIPLIER),
    jitterRatio: Number(process.env.RETRY_JITTER_RATIO),
    timeoutMs: Number(process.env.RETRY_TIMEOUT_MS),
  },
  idempotency: {
    ttlMs: Number(process.env.IDEMPOTENCY_TTL_MS),
    sweepIntervalMs: Number(process.env.IDEMPOTENCY_SWEEP_INTERVAL_MS),
    maxEntries: Number(process.env.IDEMPOTENCY_MAX_ENTRIES),
  },
  shutdownGraceMs: Number(process.env.SHUTDOWN_GRACE_MS),
});
