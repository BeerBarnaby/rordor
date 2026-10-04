import type { MissionResult, UserProgress } from '@/types';
import { LESSON_IDS } from './lessonNavigation';
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function finite(value: unknown, max: number) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max; }
function strings(value: unknown, limit = 500) { return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length <= 300))].slice(-limit) : []; }
export function isMissionResult(value: unknown): value is MissionResult {
  if (!object(value) || !object(value.skillScores)) return false;
  const requiredText = ['id', 'scenarioId', 'scenarioTitle', 'completedAt'];
  if (!requiredText.every(key => typeof value[key] === 'string' && value[key].length > 0 && value[key].length <= 300)) return false;
  if (!['overallScore', 'cprRhythmScore', 'callCompletenessScore'].every(key => finite(value[key], 100))) return false;
  if (!finite(value.totalTimeSeconds, 86400) || !finite(value.cprAverageBpm, 300)) return false;
  const scores = value.skillScores;
  if (!['sequence', 'cprRhythm', 'call1669'].every(key => finite(scores[key], 100))) return false;
  if (!['assessment', 'aed', 'responseTime'].every(key => scores[key] === null || finite(scores[key], 100))) return false;
  if (value.scoringVersion !== undefined && value.scoringVersion !== 'measured-v2') return false;
  if (value.aedRecommendation !== undefined && value.aedRecommendation !== 'shock' && value.aedRecommendation !== 'no-shock') return false;
  return Array.isArray(value.mistakes) && value.mistakes.length <= 100 && value.mistakes.every(item => typeof item === 'string' && item.length <= 1000)
    && Array.isArray(value.timeline) && value.timeline.length <= 100 && value.timeline.every(event => object(event) && typeof event.timestamp === 'string' && typeof event.title === 'string' && typeof event.isSuccess === 'boolean' && (event.note === undefined || typeof event.note === 'string'));
}
export function parseProgress(raw: string | null): UserProgress {
  let value: unknown;
  try { value = raw ? JSON.parse(raw) : {}; } catch { value = {}; }
  const data = object(value) ? value : {};
  const number = (key: string, max: number) => finite(data[key], max) ? Math.floor(data[key] as number) : 0;
  const seen = new Set<string>();
  const history = (Array.isArray(data.history) ? data.history : []).filter(isMissionResult).filter(result => {
    if (seen.has(result.id)) return false;
    seen.add(result.id); return true;
  }).slice(0, 20);
  return {
    recordedMissionIds: [...new Set([...strings(data.recordedMissionIds, 10000), ...history.map(result => result.id)])].slice(-10000),
    completedVideoIds: strings(data.completedVideoIds),
    completedTopicIds: strings(data.completedTopicIds).filter(id => LESSON_IDS.some(lesson => lesson === id)),
    missionAttemptsCount: number('missionAttemptsCount', 1000000),
    bestOverallScore: number('bestOverallScore', 100),
    bestRhythmScore: number('bestRhythmScore', 100),
    measuredBestOverallScore: Math.max(number('measuredBestOverallScore', 100), ...history.filter(result => result.scoringVersion === 'measured-v2').map(result => result.overallScore), isMissionResult(data.lastMissionResult) && data.lastMissionResult.scoringVersion === 'measured-v2' ? data.lastMissionResult.overallScore : 0),
    lastMissionResult: isMissionResult(data.lastMissionResult) ? data.lastMissionResult : null,
    history,
  };
}
