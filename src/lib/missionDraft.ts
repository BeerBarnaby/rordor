export type DraftPhase = 'opening' | 'sequence' | 'call1669' | 'cpr' | 'aed';
export interface MissionDraft {
  version: 1;
  phase: DraftPhase;
  attemptKey: number;
  sequenceScore: number;
  callScore: number;
  cprRhythmScore: number;
  cprAvgBpm: number;
  mistakes: string[];
  elapsedSeconds: number;
}
export const DRAFT_KEY = 'nong_prom_mission_checkpoint_v1';
export function parseMissionDraft(raw: string | null): MissionDraft | null {
  try {
    const d = JSON.parse(raw ?? 'null');
    if (!d || d.version !== 1 || !['opening','sequence','call1669','cpr','aed'].includes(d.phase)) return null;
    if (!Number.isInteger(d.attemptKey) || d.attemptKey < 0 || d.attemptKey > 1000000) return null;
    for (const key of ['sequenceScore','callScore','cprRhythmScore']) {
      if (!Number.isFinite(d[key]) || d[key] < 0 || d[key] > 100) return null;
    }
    if (!Number.isFinite(d.cprAvgBpm) || d.cprAvgBpm < 0 || d.cprAvgBpm > 300) return null;
    if (!Number.isFinite(d.elapsedSeconds) || d.elapsedSeconds < 0 || d.elapsedSeconds > 86400) return null;
    if (!Array.isArray(d.mistakes) || d.mistakes.length > 100 || !d.mistakes.every((x: unknown) => typeof x === 'string' && x.length <= 1000)) return null;
    return d as MissionDraft;
  } catch { return null; }
}
