export class InterpretationRefusedError extends Error {
  readonly code = 'interpretation_refused';

  constructor() {
    super('model refused to interpret the reading');
    this.name = 'InterpretationRefusedError';
  }
}
