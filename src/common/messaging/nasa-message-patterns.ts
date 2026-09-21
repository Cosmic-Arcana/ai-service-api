export const NASA_MESSAGE_PATTERNS = {
  cosmicSnapshot: 'nasa.cosmic.snapshot',
  apod: 'nasa.cosmic.apod',
  nearEarthObjects: 'nasa.cosmic.near-earth-objects',
  health: 'nasa.health.check',
} as const;

export type NasaMessagePattern =
  (typeof NASA_MESSAGE_PATTERNS)[keyof typeof NASA_MESSAGE_PATTERNS];
