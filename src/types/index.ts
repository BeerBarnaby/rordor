export interface LearningVideo {
  id: string;
  topicId: string;
  title: string;
  provider: string;
  youtubeId: string;
  duration?: string;
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
    feedback: string;
  }[];
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
  assessment: number; // 0 - 100
  sequence: number;
  cprRhythm: number;
  call1669: number;
  aed: number;
  responseTime: number;
}

export interface MissionResult {
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
  completedVideoIds: string[];
  completedTopicIds: string[];
  missionAttemptsCount: number;
  bestOverallScore: number;
  bestRhythmScore: number;
  lastMissionResult: MissionResult | null;
  history: MissionResult[];
}
