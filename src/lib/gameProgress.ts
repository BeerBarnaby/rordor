import type { UserProgress } from "@/types";

export const TOPIC_ORDER = ["assessment", "call1669", "cpr", "aed"] as const;

export const XP_PER_MISSION = 250;
export const XP_PER_LEVEL = 300;
export const MAX_LEVEL = 10;

function safeNonNegativeInteger(value: number, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(maximum, Math.max(0, Math.floor(value)));
}

export function getGameProgress(progress: UserProgress) {
  const attempts = safeNonNegativeInteger(progress.missionAttemptsCount);
  const bestScore = Math.max(safeNonNegativeInteger(progress.bestOverallScore, 100), safeNonNegativeInteger(progress.measuredBestOverallScore ?? 0, 100));
  const completedTopicCount = new Set(
    (progress.completedTopicIds ?? []).filter((topicId) =>
      TOPIC_ORDER.includes(topicId as (typeof TOPIC_ORDER)[number]),
    ),
  ).size;
  // Legacy XP is retained. Score bonus is not used to rank different versions.
  const xp = attempts * XP_PER_MISSION + bestScore;
  return getLevelProgress(xp, completedTopicCount);
}

export function getLevelProgress(value: number, completedTopicCount = 0) {
  const xp = safeNonNegativeInteger(value);
  const level = Math.min(MAX_LEVEL, Math.floor(xp / XP_PER_LEVEL) + 1);
  const xpInLevel = level === MAX_LEVEL ? XP_PER_LEVEL : xp % XP_PER_LEVEL;

  return {
    xp,
    level,
    xpInLevel,
    xpForNextLevel: XP_PER_LEVEL,
    completedTopicCount,
  };
}
