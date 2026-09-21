import type { UserProgress } from "@/types";

export const TOPIC_ORDER = ["assessment", "call1669", "cpr", "aed"] as const;

export function isTopicUnlocked(
  topicId: string,
  completedTopicIds: string[],
): boolean {
  const index = TOPIC_ORDER.indexOf(topicId as (typeof TOPIC_ORDER)[number]);
  if (index <= 0) return index === 0;
  return completedTopicIds.includes(TOPIC_ORDER[index - 1]);
}

export function getUnlockedTopicCount(completedTopicIds: string[]): number {
  let unlocked = 1;
  for (let index = 1; index < TOPIC_ORDER.length; index += 1) {
    if (!completedTopicIds.includes(TOPIC_ORDER[index - 1])) break;
    unlocked += 1;
  }
  return unlocked;
}

export function getGameProgress(progress: UserProgress) {
  const xp =
    progress.completedTopicIds.length * 100 +
    progress.missionAttemptsCount * 250 +
    progress.bestOverallScore;
  const level = Math.min(10, Math.floor(xp / 300) + 1);
  const xpInLevel = level === 10 ? 300 : xp % 300;

  return {
    xp,
    level,
    xpInLevel,
    xpForNextLevel: 300,
    unlockedTopicCount: getUnlockedTopicCount(progress.completedTopicIds),
  };
}
