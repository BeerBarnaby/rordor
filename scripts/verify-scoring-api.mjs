// Local API -> real Supabase verification. Synthetic fixture is removed by the
// companion MCP cleanup after this run; never uses a human phone or PIN.
import assert from 'node:assert/strict';
import { randomInt, randomUUID } from 'node:crypto';
const base = new URL(process.env.SCORING_TEST_BASE_URL ?? 'http://localhost:3001');
assert(['localhost', '127.0.0.1'].includes(base.hostname), 'Only run against the local verification server');
const displayName = `QA-${randomUUID().slice(0, 8)}`;
const phone = `060${String(randomInt(0, 10000000)).padStart(7, '0')}`;
const pin = String(randomInt(100000, 999999));
let cookie = ''; let fixtureId; const passed = [];
async function call(path, body) {
  const response = await fetch(new URL(path, base), { method: body === undefined ? 'GET' : 'POST', headers: { origin: base.origin, 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { response, data: await response.json() };
}
try {
  const registered = await call('/api/player/auth', { mode: 'register', phone, pin, displayName });
  assert.equal(registered.response.status, 200); fixtureId = registered.data.player.id;
  const setCookie = registered.response.headers.get('set-cookie');
  cookie = setCookie.split(';')[0];
  assert(/httponly/i.test(setCookie)); assert(/samesite=strict/i.test(setCookie));
  const session = await call('/api/player/session');
  assert.equal(session.data.player.xp, 0); passed.push('session restored with v2 stats');
  const payload = { scoringVersion: 'measured-v2', expectedPlayerId: fixtureId, clientAttemptId: `mission_${Date.now()}`, scenarioId: 'SCENARIO_ROTC_FIELD', sequenceScore: 100, callScore: 92, cprRhythmScore: 0, totalTimeSeconds: 60, audioGuided: false, overallScore: 999 };
  const saved = await call('/api/player/attempt', payload);
  assert.equal(saved.response.status, 200); assert.equal(saved.data.player.best_score, 64); assert.equal(saved.data.player.xp, 314);
  passed.push('total recomputed to 64; XP 314');
  const duplicate = await call('/api/player/attempt', payload);
  assert.equal(duplicate.response.status, 200); assert.equal(duplicate.data.player.xp, 314); assert.equal(duplicate.data.player.attempts_count, 1);
  passed.push('duplicate does not increment XP or attempts');
  assert.equal((await call('/api/player/attempt', { ...payload, expectedPlayerId: randomUUID() })).response.status, 403);
  assert.equal((await call('/api/player/attempt', { ...payload, scoringVersion: 'future-v3' })).response.status, 400);
  assert.equal((await call('/api/player/attempt', { ...payload, sequenceScore: 1 })).data.error, 'attempt_conflict');
  passed.push('wrong owner, unknown version and changed replay rejected');
  const board = await call('/api/player/leaderboard?guided=false');
  const row = board.data.find(item => item.display_name === displayName);
  assert.equal(row.best_score, 64); assert.equal(row.xp, 314);
  assert(!Object.keys(row).some(key => /phone|pin|token/.test(key)));
  passed.push('independent board returns score without contact or credential fields');
  const guided = { ...payload, clientAttemptId: `mission_${Date.now()}`, callScore: 100, cprRhythmScore: 100, audioGuided: true };
  assert.equal((await call('/api/player/attempt', guided)).data.error, 'attempt_rate_limited');
  console.log(JSON.stringify({ progress: 'Checking 20-second rate limit before guided submission' }));
  await new Promise(resolve => setTimeout(resolve, 21000));
  const guidedSaved = await call('/api/player/attempt', guided);
  assert.equal(guidedSaved.response.status, 200); assert.equal(guidedSaved.data.player.xp, 600); assert.equal(guidedSaved.data.player.best_score, 64);
  const guidedBoard = await call('/api/player/leaderboard?guided=true');
  assert.equal(guidedBoard.data.find(item => item.display_name === displayName).best_score, 100);
  passed.push('guided result separate; total XP 600; independent best still 64');
  const reloaded = await call('/api/player/session'); assert.equal(reloaded.data.player.xp, 600);
  passed.push('online XP survives session reload');
  console.log(JSON.stringify({ status: 'PASS', passed, cleanupFixture: { id: fixtureId, displayName } }));
} catch (error) {
  console.log(JSON.stringify({ status: 'FAIL', error: error.message, passed, cleanupFixture: fixtureId ? { id: fixtureId, displayName } : null }));
  process.exitCode = 1;
} finally {
  if (cookie) await fetch(new URL('/api/player/session', base), { method: 'DELETE', headers: { origin: base.origin, 'content-type': 'application/json', cookie } });
}
