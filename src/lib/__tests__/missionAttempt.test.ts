import { describe, expect, it } from 'vitest';
import { parseMeasuredAttempt } from '../missionAttempt';

const payload = { scoringVersion: 'measured-v2', expectedPlayerId: '11111111-1111-4111-8111-111111111111', clientAttemptId: 'mission_1000000000001',
  scenarioId: 'SCENARIO_ROTC_FIELD', sequenceScore: 100, callScore: 92, cprRhythmScore: 70, totalTimeSeconds: 100, audioGuided: false };
describe('measured attempt payload boundary', () => {
  it('accepts valid numeric component scores without trusting an overall score', () => {
    expect(parseMeasuredAttempt({ ...payload, overallScore: 999 })).toEqual(payload);
  });
  it.each([null, [], {}, { ...payload, scoringVersion: 'legacy-v1' }, { ...payload, expectedPlayerId: 'other' },
    { ...payload, sequenceScore: '100' }, { ...payload, callScore: null }, { ...payload, cprRhythmScore: NaN },
    { ...payload, totalTimeSeconds: 19 }, { ...payload, scenarioId: 'unknown' },
    { ...payload, clientAttemptId: 'replay' }, { ...payload, sequenceScore: 101 }])('rejects invalid data %#', value => {
      expect(parseMeasuredAttempt(value)).toBeNull();
  });
});
