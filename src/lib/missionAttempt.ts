import type { MissionResult } from '@/types';

export const SCORING_VERSION = 'measured-v2' as const;
const scenarios = new Set(['SCENARIO_ROTC_FIELD', 'SCENARIO_ROTC_BUILDING', 'SCENARIO_ROTC_ACTIVITY']);
export const PLAYER_ID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export type MeasuredAttempt = {
  scoringVersion: typeof SCORING_VERSION;
  expectedPlayerId: string;
  clientAttemptId: string;
  scenarioId: string;
  sequenceScore: number;
  callScore: number;
  cprRhythmScore: number;
  totalTimeSeconds: number;
  audioGuided: false;
};
export function parseMeasuredAttempt(value: unknown): MeasuredAttempt | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const score = (v: unknown) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 100;
  if (body.scoringVersion !== SCORING_VERSION || typeof body.expectedPlayerId !== 'string' || !PLAYER_ID_PATTERN.test(body.expectedPlayerId)
    || typeof body.clientAttemptId !== 'string' || !/^mission_[0-9]{13}$/.test(body.clientAttemptId)
    || typeof body.scenarioId !== 'string' || !scenarios.has(body.scenarioId)
    || !score(body.sequenceScore) || !score(body.callScore) || !score(body.cprRhythmScore)
    || typeof body.totalTimeSeconds !== 'number' || !Number.isInteger(body.totalTimeSeconds) || body.totalTimeSeconds < 20 || body.totalTimeSeconds > 86400) return null;
  return { scoringVersion: SCORING_VERSION, expectedPlayerId: body.expectedPlayerId, clientAttemptId: body.clientAttemptId, scenarioId: body.scenarioId,
    sequenceScore: body.sequenceScore as number, callScore: body.callScore as number, cprRhythmScore: body.cprRhythmScore as number,
    totalTimeSeconds: body.totalTimeSeconds, audioGuided: false };
}
export function measuredPayload(result: MissionResult) {
  return parseMeasuredAttempt({ scoringVersion: result.scoringVersion, expectedPlayerId: result.playerId, clientAttemptId: result.id,
    scenarioId: result.scenarioId, sequenceScore: result.skillScores.sequence, callScore: result.callCompletenessScore,
    cprRhythmScore: result.cprRhythmScore, totalTimeSeconds: result.totalTimeSeconds });
}
