export interface LearningVideo {
  id: string;
  topicId: string;
  title: string;
  provider: string;
  youtubeId: string;
  duration?: string;
  contextLabel?: string;
  description: string;
}

export interface LearningDocument {
  id: string;
  topicId: string;
  title: string;
  provider: string;
  url: string;
  description: string;
  type: 'pdf' | 'manual' | 'article';
  checkedAt: string;
  isAvailable: boolean;
}

export interface LearningTopic {
  id: string;
  title: string;
  iconName: string;
  description: string;
  summarySteps: string[];
}

export interface SequenceCardItem {
  id: string;
  title: string;
  subtitle?: string;
  isCorrect: boolean;
  correctOrder?: number;
  feedbackIfWrong?: string;
  feedbackIfCorrect?: string;
}

export interface EmergencyCallField {
  id: string;
  label: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    status?: 'correct' | 'incomplete' | 'incorrect';
    feedback: string;
  }[];
}

export interface ScenarioVariant {
  id: string;
  code: string;
  title: string;
  setting: string;
  opening: string;
  locationAnswer: string;
  situationAnswer: string;
  victimAnswer: string;
}

export interface AEDStepItem {
  id: string;
  title: string;
  description: string;
  correctOrder: number;
  icon: string;
  isDistractor?: boolean;
}

export type RhythmFeedbackState = 'insufficient' | 'slow' | 'good' | 'fast';

export interface RhythmCalculationResult {
  bpm: number;
  state: RhythmFeedbackState;
  feedbackMessage: string;
  colorClass: string;
  tapCount: number;
}

export interface TimelineEntry {
  timestamp: string;
  title: string;
  isSuccess: boolean;
  note?: string;
}

export interface SkillScores {
  assessment: number | null; // null = not independently measured
  sequence: number;
  cprRhythm: number;
  call1669: number;
  aed: number | null;
  responseTime: number | null;
}

export interface MissionResult {
  playerId?: string; // Owner at completion; Guest results are never auto-uploaded after login.
  cprAudioGuided?: boolean;
  scoringVersion?: 'measured-v2';
  aedRecommendation?: 'shock' | 'no-shock';
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  completedAt: string;
  totalTimeSeconds: number;
  overallScore: number;
  skillScores: SkillScores;
  timeline: TimelineEntry[];
  cprAverageBpm: number;
  cprRhythmScore: number;
  callCompletenessScore: number;
  mistakes: string[];
}

export interface UserProgress {
  recordedMissionIds?: string[];
  measuredBestOverallScore?: number;
  completedVideoIds: string[];
  completedTopicIds: string[];
  missionAttemptsCount: number;
  bestOverallScore: number;
  bestRhythmScore: number;
  lastMissionResult: MissionResult | null;
  history: MissionResult[];
}

export interface PlayerProfile {
  xp?: number;
  level?: number;
  measuredAttemptsCount?: number;
  id: string;
  displayName: string;
  bestScore: number;
  bestRhythmScore: number;
  attemptsCount: number;
  rank: number | null;
}

export interface LeaderboardEntry {
  xp?: number;
  audioGuided?: boolean;
  rank: number;
  displayName: string;
  bestScore: number;
  bestRhythmScore: number;
  attemptsCount: number;
  level: number;
}
