import { MissionResult, UserProgress } from '@/types';

const PROGRESS_KEY = 'nong_prom_user_progress_v1';
let volatileProgress: UserProgress | null = null;

const defaultProgress: UserProgress = {
  completedVideoIds: [],
  completedTopicIds: [],
  missionAttemptsCount: 0,
  bestOverallScore: 0,
  bestRhythmScore: 0,
  lastMissionResult: null,
  history: [],
};

export class ProgressService {
  public static isPersisted(): boolean { return volatileProgress === null; }
  public static parseProgress(raw: string | null): UserProgress {
    const fallback = structuredClone(defaultProgress);
    if (!raw) return volatileProgress ?? fallback;
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return fallback;
      const safeInt = (value: unknown, max = Number.MAX_SAFE_INTEGER) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(0, Math.floor(value))) : 0;
      const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
      const history: MissionResult[] = Array.isArray(data.history) ? data.history.filter((item: MissionResult) => item && typeof item.id === 'string' && item.skillScores && typeof item.overallScore === 'number' && typeof item.cprRhythmScore === 'number').slice(0, 20) : [];
      return { ...fallback, completedVideoIds: strings(data.completedVideoIds), completedTopicIds: strings(data.completedTopicIds),
        missionAttemptsCount: Math.max(safeInt(data.missionAttemptsCount), history.length), bestOverallScore: safeInt(data.bestOverallScore,100), bestRhythmScore: safeInt(data.bestRhythmScore,100),
        measuredBestOverallScore: Math.max(safeInt(data.measuredBestOverallScore,100), ...history.filter(item => item.scoringVersion === 'measured-v2').map(item => safeInt(item.overallScore,100))),
        lastMissionResult: history.find(item => item.id === data.lastMissionResult?.id) ?? history[0] ?? null,
        history, recordedMissionIds: [...new Set([...strings(data.recordedMissionIds), ...history.map(item => item.id)])] };
    } catch { return volatileProgress ?? fallback; }
  }
  public static snapshot(): string | null {
    if (typeof window === 'undefined') return null;
    if (volatileProgress) return JSON.stringify(volatileProgress);
    try { return localStorage.getItem(PROGRESS_KEY); } catch { return null; }
  }
  public static getProgress(): UserProgress {
    if (typeof window === 'undefined') return structuredClone(defaultProgress);
    return this.parseProgress(this.snapshot());
  }

  public static saveProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      volatileProgress = null;
    } catch (e) {
      volatileProgress = structuredClone(progress);
      console.error('Failed to save progress to localStorage', e);
    }
    window.dispatchEvent(new Event('training-progress'));
  }

  public static markVideoCompleted(videoId: string): UserProgress {
    const progress = this.getProgress();
    if (!progress.completedVideoIds.includes(videoId)) {
      progress.completedVideoIds.push(videoId);
      this.saveProgress(progress);
    }
    return progress;
  }

  public static markTopicCompleted(topicId: string): UserProgress {
    const progress = this.getProgress();
    if (!progress.completedTopicIds.includes(topicId)) {
      progress.completedTopicIds.push(topicId);
      this.saveProgress(progress);
    }
    return progress;
  }

  public static recordMissionResult(result: MissionResult): UserProgress {
    const progress = this.getProgress();
    const recordedIds = new Set([...(progress.recordedMissionIds ?? []), ...progress.history.map(item => item.id)]);
    if (recordedIds.has(result.id)) return progress;
    recordedIds.add(result.id);
    progress.recordedMissionIds = [...recordedIds];
    progress.missionAttemptsCount += 1;
    progress.lastMissionResult = result;
    progress.history.unshift(result); // latest first
    
    // Keep max 20 history items
    if (progress.history.length > 20) {
      progress.history = progress.history.slice(0, 20);
    }

    if (result.scoringVersion === 'measured-v2') {
      progress.measuredBestOverallScore = Math.max(progress.measuredBestOverallScore ?? 0, result.overallScore);
    } else if (result.overallScore > progress.bestOverallScore) {
      progress.bestOverallScore = result.overallScore;
    }

    if (result.cprRhythmScore > progress.bestRhythmScore) {
      progress.bestRhythmScore = result.cprRhythmScore;
    }

    this.saveProgress(progress);
    return progress;
  }

  public static resetProgress(): UserProgress {
    volatileProgress = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROGRESS_KEY);
    }
    return structuredClone(defaultProgress);
  }
}
