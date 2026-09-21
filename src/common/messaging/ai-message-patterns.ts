export const AI_MESSAGE_PATTERNS = {
  createPrediction: 'ai.prediction.create',
  drawCards: 'ai.tarot.draw',
  tarotCard: 'ai.tarot.card',
  interpretReading: 'ai.reading.interpret',
  health: 'ai.health.check',
} as const;

export type AiMessagePattern =
  (typeof AI_MESSAGE_PATTERNS)[keyof typeof AI_MESSAGE_PATTERNS];
