import { createDrawSeed, DrawSeedInput } from './draw-seed';

const base: DrawSeedInput = {
  userId: 'user-123',
  question: 'Will the new job suit me?',
  spreadId: 'three-card',
  drawnAt: new Date('2026-09-21T09:00:00.000Z'),
};

describe('createDrawSeed', () => {
  it('is stable for identical input', () => {
    expect(createDrawSeed(base)).toBe(createDrawSeed({ ...base }));
  });

  it('treats questions that differ only in case and whitespace as the same question', () => {
    expect(createDrawSeed({ ...base, question: '  will the NEW   job suit me? ' })).toBe(
      createDrawSeed(base),
    );
  });

  it('keeps the same seed for the whole UTC day', () => {
    expect(
      createDrawSeed({
        ...base,
        drawnAt: new Date('2026-09-21T23:59:59.999Z'),
      }),
    ).toBe(createDrawSeed(base));
  });

  it('changes the seed on the next UTC day', () => {
    expect(
      createDrawSeed({
        ...base,
        drawnAt: new Date('2026-09-22T00:00:00.000Z'),
      }),
    ).not.toBe(createDrawSeed(base));
  });

  it.each<Partial<DrawSeedInput>>([
    { userId: 'user-456' },
    { question: 'Should I move abroad?' },
    { spreadId: 'single' },
  ])('changes the seed when %p changes', (change) => {
    expect(createDrawSeed({ ...base, ...change })).not.toBe(createDrawSeed(base));
  });

  it('never embeds the question text in the seed', () => {
    expect(createDrawSeed(base)).toMatch(/^[0-9a-f]{64}$/);
  });
});
