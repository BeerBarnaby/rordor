import { MissionResult, UserProgress } from '@/types';

const PROGRESS_KEY = 'nong_prom_user_progress_v1';

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
  public static getProgress(): UserProgress {
    if (typeof window === 'undefined') return defaultProgress;
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      if (!data) return defaultProgress;
      return JSON.parse(data) as UserProgress;
    } catch {
      return defaultProgress;
    }
  }

  public static saveProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }

  public static markVideoCompleted(videoId: string): UserProgress {
    const progress = this.getProgress();
    if (!progress.completedVideoIds.includes(videoId)) {
      progress.completedVideoIds.push(videoId);
      this.saveProgress(progress);
    }
    return progress;
  }

  public static recordMissionResult(result: MissionResult): UserProgress {
    const progress = this.getProgress();
    
    progress.missionAttemptsCount += 1;
    progress.lastMissionResult = result;
    progress.history.unshift(result); // latest first
    
    // Keep max 20 history items
    if (progress.history.length > 20) {
      progress.history = progress.history.slice(0, 20);
    }

    if (result.overallScore > progress.bestOverallScore) {
      progress.bestOverallScore = result.overallScore;
    }

    if (result.cprRhythmScore > progress.bestRhythmScore) {
      progress.bestRhythmScore = result.cprRhythmScore;
    }

    this.saveProgress(progress);
    return progress;
  }

  public static resetProgress(): UserProgress {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROGRESS_KEY);
    }
    return defaultProgress;
  }
}
