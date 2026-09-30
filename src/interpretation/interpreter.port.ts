import type { InterpretReadingPayload } from './interpretation.contract';

/**
 * The seam the Anthropic adapter will slot into. Everything above it — validation, framing, the
 * shape of a reading — is the application's, not the model's.
 */
export abstract class InterpreterPort {
  abstract readonly name: string;
  abstract interpret(payload: InterpretReadingPayload): Promise<string>;
}
