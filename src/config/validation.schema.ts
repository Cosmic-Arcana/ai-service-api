import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'log', 'debug', 'verbose').default('log'),

  HTTP_PORT: Joi.number().port().default(3002),
  TCP_HOST: Joi.string().hostname().default('127.0.0.1'),
  TCP_PORT: Joi.number().port().default(4002),

  NASA_API_BASE_URL: Joi.string().uri({ scheme: ['http', 'https'] }).default('https://api.nasa.gov'),

  // DEMO_KEY is NASA's shared public key: heavily rate limited, so it is refused outside development.
  NASA_API_KEY: Joi.string()
    .min(1)
    .required()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.string().disallow('DEMO_KEY').min(16),
    }),

  RETRY_MAX_ATTEMPTS: Joi.number().integer().min(1).max(10).default(3),
  RETRY_INITIAL_DELAY_MS: Joi.number().integer().min(0).default(200),
  RETRY_MAX_DELAY_MS: Joi.number().integer().min(0).default(5_000),
  RETRY_BACKOFF_MULTIPLIER: Joi.number().min(1).default(2),
  RETRY_JITTER_RATIO: Joi.number().min(0).max(1).default(0.3),
  RETRY_TIMEOUT_MS: Joi.number().integer().min(100).default(5_000),

  IDEMPOTENCY_TTL_MS: Joi.number().integer().min(1_000).default(24 * 60 * 60 * 1_000),
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
