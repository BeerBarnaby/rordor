import type { MissionResult } from '@/types';
import { measuredPayload, parseMeasuredAttempt, type MeasuredAttempt } from './missionAttempt';

const KEY = 'nong_prom_attempt_outbox_v2';
let volatileQueue: MeasuredAttempt[] | null = null;
export function outboxSnapshot() {
  if (typeof window === 'undefined') return '[]';
  if (volatileQueue) return JSON.stringify(volatileQueue);
  try { return localStorage.getItem(KEY) ?? '[]'; } catch { return '[]'; }
}
export function pendingAttempts(playerId: string): MeasuredAttempt[] {
  try {
    const entries: unknown = JSON.parse(outboxSnapshot());
    return Array.isArray(entries) ? entries.map(parseMeasuredAttempt).filter((item): item is MeasuredAttempt => item !== null && item.expectedPlayerId === playerId).slice(0, 100) : [];
  } catch { return []; }
}
function allPending(): MeasuredAttempt[] {
  try { const data = JSON.parse(outboxSnapshot()); return Array.isArray(data) ? data.map(parseMeasuredAttempt).filter((item): item is MeasuredAttempt => item !== null) : []; } catch { return []; }
}
function writePending(entries: MeasuredAttempt[]) {
  let durable = true;
  try { localStorage.setItem(KEY, JSON.stringify(entries)); volatileQueue = null; }
  catch { volatileQueue = entries; durable = false; }
  window.dispatchEvent(new Event('training-outbox'));
  return durable;
}
export function enqueueAttempt(result: MissionResult) {
  const payload = measuredPayload(result);
  if (!payload) return { queued: false, durable: false };
  const entries = allPending();
  if (entries.some(item => item.expectedPlayerId === payload.expectedPlayerId && item.clientAttemptId === payload.clientAttemptId)) return { queued: true, durable: volatileQueue === null };
  if (entries.length >= 100) return { queued: false, durable: false };
  return { queued: true, durable: writePending([...entries, payload]) };
}
export function acknowledgeAttempt(playerId: string, id: string) {
  writePending(allPending().filter(item => item.expectedPlayerId !== playerId || item.clientAttemptId !== id));
}
export function subscribeOutbox(callback: () => void) {
  window.addEventListener('storage', callback); window.addEventListener('training-outbox', callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener('training-outbox', callback); };
}
