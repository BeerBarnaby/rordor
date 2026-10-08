import { describe, expect, it } from 'vitest';
import { nextPracticeFor } from '../trainingReview';

const result = (sequence: number, call: number, rhythm: number) => ({ skillScores: { assessment: null, sequence, call1669: call, cprRhythm: rhythm, aed: null, responseTime: null }, callCompletenessScore: call, cprRhythmScore: rhythm });

describe('next practice suggestion without changing scores', () => {
  it('recommends the lowest area below its existing target', () => {
    expect(nextPracticeFor(result(100, 83, 40)).topic).toBe('cpr');
    expect(nextPracticeFor(result(43, 50, 80)).topic).toBe('assessment');
    expect(nextPracticeFor(result(100, 50, 80)).topic).toBe('call1669');
  });
  it('uses rhythm target 70 and other targets 80', () => {
    expect(nextPracticeFor(result(79, 80, 70)).topic).toBe('assessment');
    expect(nextPracticeFor(result(80, 80, 70)).needsReview).toBe(false);
  });
  it('never recommends optional AED or treats results as a certification', () => {
    expect(nextPracticeFor(result(100, 100, 100))).toMatchObject({ topic: 'assessment', needsReview: false });
  });
});
