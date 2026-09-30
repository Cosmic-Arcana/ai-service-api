import { RpcException } from '@nestjs/microservices';
import type { InterpretReadingPayload, InterpretReadingResult } from './interpretation.contract';
import type { InterpreterPort } from './interpreter.port';

/** Every reading carries it, whichever interpreter produced the text. */
export const FICTION_NOTICE =
  'This reading is fiction, written for reflection and entertainment. It predicts nothing.';

const reject = (message: string): never => {
  throw new RpcException({ code: 'invalid_payload', message });
};

/**
 * The application owns the frame: it decides what a valid reading is and how it closes, and only
 * the middle — the actual language — comes from the interpreter.
 */
export const interpretReading = async (
  interpreter: InterpreterPort,
  payload: InterpretReadingPayload,
): Promise<InterpretReadingResult> => {
  if (payload.question.trim() === '') {
    reject('question must be a non-empty string');
  }
  if (payload.cards.length === 0) {
    reject('a reading needs at least one drawn card');
  }

  const body = await interpreter.interpret(payload);

  return {
    text: `${body.trimEnd()}\n\n${FICTION_NOTICE}`,
    cards: payload.cards,
    interpreter: interpreter.name,
  };
};
