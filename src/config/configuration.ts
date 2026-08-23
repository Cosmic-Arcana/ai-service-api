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

export interface AppConfig {
  serviceName: string;
  nodeEnv: string;
  logLevel: string;
  http: { port: number };
  tcp: { host: string; port: number };
  nasaService: { host: string; port: number };
  aiProvider: { apiKey: string; model: string };
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
  aiProvider: {
    apiKey: process.env.AI_PROVIDER_API_KEY as string,
    model: process.env.AI_MODEL as string,
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
