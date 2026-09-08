import { RhythmCalculationResult, RhythmFeedbackState } from '@/types';

export class RhythmCalculator {
  private timestamps: number[] = [];
  private readonly maxWindowSize: number;

  constructor(maxWindowSize: number = 6) {
    this.maxWindowSize = maxWindowSize;
  }

  public reset(): void {
    this.timestamps = [];
  }

  public addTap(timestampMs: number = Date.now()): RhythmCalculationResult {
    this.timestamps.push(timestampMs);

    // Keep only the recent timestamps to maintain the rolling window size (+1 timestamp for windowSize intervals)
    if (this.timestamps.length > this.maxWindowSize + 1) {
      this.timestamps.shift();
    }

    return this.calculateResult();
  }

  public calculateResult(): RhythmCalculationResult {
    const tapCount = this.timestamps.length;

    if (tapCount < 2) {
      return {
        bpm: 0,
        state: 'insufficient',
        feedbackMessage: 'เริ่มกดจังหวะปั๊มหัวใจ (เป้าหมาย 100-120 ครั้ง/นาที)',
        colorClass: 'text-slate-400 border-slate-600',
        tapCount,
      };
    }

    // Calculate intervals between consecutive timestamps
    const intervals: number[] = [];
    for (let i = 1; i < this.timestamps.length; i++) {
      intervals.push(this.timestamps[i] - this.timestamps[i - 1]);
    }

    const avgIntervalMs = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    
    // Avoid division by zero or unrealistically small intervals (<100ms = 600 BPM)
    if (avgIntervalMs <= 100) {
      return {
        bpm: 600,
        state: 'fast',
        feedbackMessage: 'เร็วเกินไปมาก ลดจังหวะลง',
        colorClass: 'text-rose-500 border-rose-500',
        tapCount,
      };
    }

    const bpm = Math.round(60000 / avgIntervalMs);

    let state: RhythmFeedbackState;
    let feedbackMessage: string;
    let colorClass: string;

    if (bpm < 100) {
      state = 'slow';
      feedbackMessage = 'ช้าไป เพิ่มจังหวะอีกเล็กน้อย';
      colorClass = 'text-amber-400 border-amber-400/50 bg-amber-500/10';
    } else if (bpm <= 120) {
      state = 'good';
      feedbackMessage = 'จังหวะดี รักษาไว้';
      colorClass = 'text-emerald-400 border-emerald-400/50 bg-emerald-500/10';
    } else {
      state = 'fast';
      feedbackMessage = 'เร็วไป ลดจังหวะลง';
      colorClass = 'text-orange-400 border-orange-400/50 bg-orange-500/10';
    }

    return {
      bpm,
      state,
      feedbackMessage,
      colorClass,
      tapCount,
    };
  }

  /**
   * Calculates overall Compression Rhythm Score (0 - 100) based on all recorded BPM readings
   */
  public static calculateOverallRhythmScore(inTargetTapCount: number, totalCompressions: number): number {
    if (totalCompressions <= 0) return 0;
    const ratio = inTargetTapCount / totalCompressions;
    return Math.min(100, Math.round(ratio * 100));
  }
}
