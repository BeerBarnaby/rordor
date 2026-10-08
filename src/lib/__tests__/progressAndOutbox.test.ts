import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type { MissionResult } from '@/types';

const playerA = '11111111-1111-4111-8111-111111111111';
const playerB = '22222222-2222-4222-8222-222222222222';
const result = (index = 1, playerId: string | undefined = playerA): MissionResult => ({
  id: `mission_${String(1000000000000 + index)}`, playerId, scoringVersion: 'measured-v2', scenarioId: 'SCENARIO_ROTC_FIELD', scenarioTitle: 'ทดสอบ',
  completedAt: '2026-10-08', totalTimeSeconds: 60, overallScore: 80, cprRhythmScore: 60, callCompletenessScore: 80,
  cprAverageBpm: 110, mistakes: [], timeline: [], skillScores: { assessment: null, sequence: 100, call1669: 80, cprRhythm: 60, aed: null, responseTime: null },
});
let stored: Map<string, string>;
beforeEach(() => {
  vi.resetModules(); stored = new Map();
  vi.stubGlobal('window', { dispatchEvent: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });
  vi.stubGlobal('localStorage', { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value), removeItem: (key: string) => stored.delete(key) });
});
afterEach(() => vi.unstubAllGlobals());
describe('recording progress', () => {
  it('records a result exactly once even after its detail ages out of history', async () => {
    const { ProgressService } = await import('../progress');
    for (let n=1; n<=21; n++) ProgressService.recordMissionResult(result(n));
    const progress = ProgressService.recordMissionResult(result(1));
    expect(progress.missionAttemptsCount).toBe(21); expect(progress.history.length).toBe(20); expect(progress.measuredBestOverallScore).toBe(80);
  });
  it('keeps local progress in this session when storage is blocked', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('localStorage', { getItem: () => {throw Error('blocked');}, setItem: () => {throw Error('blocked');} });
    const { ProgressService } = await import('../progress'); ProgressService.recordMissionResult(result());
    expect(ProgressService.getProgress().missionAttemptsCount).toBe(1); vi.restoreAllMocks();
  });
  it('normalizes corrupt arrays and numbers without crashing training', async () => {
    const { ProgressService } = await import('../progress');
    expect(ProgressService.parseProgress('{bad').missionAttemptsCount).toBe(0);
    expect(ProgressService.parseProgress(JSON.stringify({ completedTopicIds: 'wrong', history: {}, missionAttemptsCount: -1 })).history).toEqual([]);
  });
});
describe('ownership-bound outbox', () => {
  it('queues once, isolates accounts and removes only an acknowledged result', async () => {
    const outbox = await import('../attemptOutbox');
    outbox.enqueueAttempt(result()); outbox.enqueueAttempt(result()); outbox.enqueueAttempt(result(2, playerB));
    expect(outbox.pendingAttempts(playerA)).toHaveLength(1); expect(outbox.pendingAttempts(playerB)).toHaveLength(1);
    outbox.acknowledgeAttempt(playerA, result().id);
    expect(outbox.pendingAttempts(playerA)).toHaveLength(0); expect(outbox.pendingAttempts(playerB)).toHaveLength(1);
  });
  it('never auto-uploads guest results and handles broken queue data', async () => {
    const outbox = await import('../attemptOutbox');
    const guest = result(); delete guest.playerId;
    expect(outbox.enqueueAttempt(guest).queued).toBe(false);
    stored.set('nong_prom_attempt_outbox_v2', '[null,{"expectedPlayerId":"bad"}]');
    expect(outbox.pendingAttempts(playerA)).toEqual([]);
  });
  it('retains an in-memory queue if storage is unavailable', async () => {
    vi.stubGlobal('localStorage', { getItem: () => {throw Error('blocked');}, setItem: () => {throw Error('blocked');} });
    const outbox = await import('../attemptOutbox');
    expect(outbox.enqueueAttempt(result())).toEqual({ queued: true, durable: false });
    expect(outbox.pendingAttempts(playerA)).toHaveLength(1);
  });
});
