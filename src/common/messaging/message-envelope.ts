export interface MessageMeta {
  correlationId: string;
  idempotencyKey?: string;
  issuedAt: string;
  origin: string;
}

/**
 * Every TCP message is wrapped in this envelope. The transport has no header concept,
 * so cross-cutting metadata has to travel inside the payload itself.
 */
export interface MessageEnvelope<TData = unknown> {
  meta: MessageMeta;
  data: TData;
}

export const isMessageEnvelope = (value: unknown): value is MessageEnvelope =>
  typeof value === 'object' &&
  value !== null &&
  'meta' in value &&
  typeof (value as MessageEnvelope).meta?.correlationId === 'string';
