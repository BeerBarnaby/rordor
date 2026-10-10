import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), token: { value: 'a'.repeat(64) as string | undefined } }));
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => mocks.token.value ? { value: mocks.token.value } : undefined, set: vi.fn() }) }));
vi.mock('@/lib/supabase/server', () => ({ callSupabaseRpc: mocks.rpc }));
import { POST } from '@/app/api/player/attempt/route';
import { GET } from '@/app/api/player/leaderboard/route';
const playerId = '11111111-1111-4111-8111-111111111111';
const data = { scoringVersion: 'measured-v2', expectedPlayerId: playerId, clientAttemptId: 'mission_1000000000001', scenarioId: 'SCENARIO_ROTC_FIELD', sequenceScore: 100, callScore: 92, cprRhythmScore: 0, totalTimeSeconds: 60, audioGuided: false };
const request = (body: unknown, origin = 'http://localhost:3001') => new Request('http://localhost:3001/api/player/attempt', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => {
  mocks.rpc.mockReset(); mocks.token.value = 'a'.repeat(64);
  mocks.rpc.mockImplementation(async (name: string) => name === 'get_game_player_v2' ? { ok: true, player: { id: playerId } } : { ok: true, player: { id: playerId, xp: 314, best_score: 64 } });
});
describe('score API', () => {
  it('requires a session and trusted origin', async () => {
    expect((await POST(request(data, 'https://untrusted.example'))).status).toBe(403);
    mocks.token.value = undefined;
    expect((await POST(request(data))).status).toBe(401); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('passes component scores rather than an arbitrary total to the v2 RPC', async () => {
    expect((await POST(request({ ...data, overallScore: 999 }))).status).toBe(200);
    expect(mocks.rpc).toHaveBeenLastCalledWith('submit_game_attempt_v2', expect.objectContaining({ p_sequence_score: 100, p_call_score: 92, p_cpr_rhythm_score: 0 }));
    expect(mocks.rpc.mock.calls[1][1]).not.toHaveProperty('p_overall_score');
  });
  it('rejects changed accounts before writing any attempt', async () => {
    const response = await POST(request({ ...data, expectedPlayerId: '22222222-2222-4222-8222-222222222222' }));
    expect(response.status).toBe(403); expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });
  it.each([null, { ...data, scoringVersion: 'future-v3' }, { ...data, sequenceScore: -1 }])('rejects invalid score data %#', async value => {
    expect((await POST(request(value))).status).toBe(400); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('keeps legacy API compatibility without submitting legacy totals to v2', async () => {
    expect((await POST(request({ clientAttemptId: data.clientAttemptId, scenarioId: data.scenarioId, overallScore: 50, cprRhythmScore: 50, totalTimeSeconds: 60 }))).status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith('submit_game_attempt', expect.anything());
  });
  it('returns service unavailability rather than false success', async () => {
    mocks.rpc.mockRejectedValueOnce(Error('offline'));
    expect((await POST(request(data))).status).toBe(503);
  });
  it('uses the standard leaderboard without an audio category', async () => {
    mocks.rpc.mockResolvedValueOnce([]);
    expect((await GET()).status).toBe(200);
    expect(mocks.rpc).toHaveBeenLastCalledWith('get_public_leaderboard_v2', { p_limit: 20, p_audio_guided: false });
  });
});
