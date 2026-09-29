import * as Joi from 'joi';
import { AI_EFFORT_LEVELS } from './configuration';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'log', 'debug', 'verbose').default('log'),

  HTTP_PORT: Joi.number().port().default(3001),
  TCP_HOST: Joi.string().hostname().default('127.0.0.1'),
  TCP_PORT: Joi.number().port().default(4001),

  NASA_SERVICE_TCP_HOST: Joi.string().hostname().default('127.0.0.1'),
  NASA_SERVICE_TCP_PORT: Joi.number().port().default(4002),

  // Validated here but deliberately not loaded into config: the Anthropic SDK reads it from the
  // environment itself. Outside production the SDK can fall back to an `ant auth login` profile.
  ANTHROPIC_API_KEY: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required() }),
  AI_MODEL: Joi.string().default('claude-opus-5'),
  AI_EFFORT: Joi.string()
    .valid(...AI_EFFORT_LEVELS)
    .default('high'),
  AI_TIMEOUT_MS: Joi.number().integer().min(1_000).default(60_000),

  RETRY_MAX_ATTEMPTS: Joi.number().integer().min(1).max(10).default(3),
  RETRY_INITIAL_DELAY_MS: Joi.number().integer().min(0).default(200),
  RETRY_MAX_DELAY_MS: Joi.number().integer().min(0).default(5_000),
  RETRY_BACKOFF_MULTIPLIER: Joi.number().min(1).default(2),
  RETRY_JITTER_RATIO: Joi.number().min(0).max(1).default(0.3),
  RETRY_TIMEOUT_MS: Joi.number().integer().min(100).default(5_000),

  IDEMPOTENCY_TTL_MS: Joi.number()
    .integer()
    .min(1_000)
    .default(24 * 60 * 60 * 1_000),
  IDEMPOTENCY_SWEEP_INTERVAL_MS: Joi.number().integer().min(1_000).default(60_000),
  IDEMPOTENCY_MAX_ENTRIES: Joi.number().integer().min(1).default(10_000),

  SHUTDOWN_GRACE_MS: Joi.number().integer().min(0).default(10_000),
}).custom((value: Record<string, number>, helpers) => {
  if (value.RETRY_MAX_DELAY_MS < value.RETRY_INITIAL_DELAY_MS) {
    return helpers.error('any.invalid', {
      message: 'RETRY_MAX_DELAY_MS must be greater than or equal to RETRY_INITIAL_DELAY_MS',
    });
  }
  return value;
});
