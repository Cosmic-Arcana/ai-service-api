import { createPrediction } from './create-prediction.use-case';
import type { ReadingInterpreterPort } from './reading-interpreter.port';

describe('createPrediction', () => {
  it('draws cards then asks the interpreter', async () => {
    const interpret = jest.fn().mockResolvedValue({
      interpretation: 'fiction only',
      fictional: true,
    });
    const interpreter: ReadingInterpreterPort = { interpret };
    const result = await createPrediction(
      {
        userId: 'user-123',
        question: 'Will the new job suit me?',
        spreadId: 'three-card',
        askedAt: '2026-09-21T09:00:00.000Z',
      },
      interpreter,
    );
    expect(result.draw.cards).toHaveLength(3);
    expect(result.interpretation.fictional).toBe(true);
    expect(interpret).toHaveBeenCalledWith(
      expect.objectContaining({ question: 'Will the new job suit me?' }),
    );
  });
});
