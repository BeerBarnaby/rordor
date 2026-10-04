import { describe, expect, it } from 'vitest';
import { readNavigation } from '../lessonNavigation';
import { parseProgress } from '../progressValidation';
describe('lesson links', () => {
  it('opens specific lessons and handles invalid links', () => {
    expect(readNavigation('#lessons/aed')).toEqual({ tab: 'learn', selectedLesson: 'aed' });
    expect(readNavigation('#lessons/invalid').selectedLesson).toBeNull();
    expect(readNavigation('#practice').tab).toBe('mission');
    expect(readNavigation('#unknown').tab).toBe('home');
  });
});
describe('stored progress validation', () => {
  const valid = { id: 'mission_test', scenarioId: 'field', scenarioTitle: 'Test', completedAt: '2026-10-04', totalTimeSeconds: 200, overallScore: 80, skillScores: { assessment: null, sequence: 80, cprRhythm: 80, call1669: 80, aed: null, responseTime: null }, timeline: [], cprAverageBpm: 110, cprRhythmScore: 80, callCompletenessScore: 80, mistakes: [], scoringVersion: 'measured-v2' };
  it('preserves valid measured results and removes duplicate history', () => {
    const progress = parseProgress(JSON.stringify({ history: [valid, valid], lastMissionResult: valid }));
    expect(progress.history).toHaveLength(1);
    expect(progress.lastMissionResult?.overallScore).toBe(80);
    expect(progress.measuredBestOverallScore).toBe(80);
  });
  it('does not allow malformed scores to restore a result', () => {
    expect(parseProgress(JSON.stringify({ lastMissionResult: { ...valid, skillScores: null } })).lastMissionResult).toBeNull();
  });
  it.each(['null', '[]', 'broken', '42', '{"history":[null],"lastMissionResult":{}}'])('safely recovers %s', raw => {
    const progress = parseProgress(raw);
    expect(progress.history).toEqual([]);
    expect(progress.lastMissionResult).toBeNull();
    expect(progress.completedTopicIds).toEqual([]);
  });
  it('keeps valid progress while discarding invalid fields', () => {
    expect(parseProgress(JSON.stringify({ completedTopicIds: ['aed', 'aed', 'invalid'], missionAttemptsCount: 3, bestOverallScore: 999, bestRhythmScore: 70 }))).toMatchObject({ completedTopicIds: ['aed'], missionAttemptsCount: 3, bestOverallScore: 0, bestRhythmScore: 70 });
  });
});
