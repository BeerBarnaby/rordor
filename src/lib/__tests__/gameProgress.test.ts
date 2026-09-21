import { describe, expect, it } from "vitest";
import { getGameProgress, getUnlockedTopicCount, isTopicUnlocked } from "../gameProgress";
import type { UserProgress } from "@/types";

const baseProgress: UserProgress = {
  completedVideoIds: [],
  completedTopicIds: [],
  missionAttemptsCount: 0,
  bestOverallScore: 0,
  bestRhythmScore: 0,
  lastMissionResult: null,
  history: [],
};

describe("game progression", () => {
  it("starts with only the first topic unlocked", () => {
    expect(getUnlockedTopicCount([])).toBe(1);
    expect(isTopicUnlocked("assessment", [])).toBe(true);
    expect(isTopicUnlocked("call1669", [])).toBe(false);
  });

  it("unlocks topics in order", () => {
    const completed = ["assessment", "call1669"];
    expect(getUnlockedTopicCount(completed)).toBe(3);
    expect(isTopicUnlocked("cpr", completed)).toBe(true);
    expect(isTopicUnlocked("aed", completed)).toBe(false);
  });

  it("calculates xp and level from learning and missions", () => {
    expect(
      getGameProgress({
        ...baseProgress,
        completedTopicIds: ["assessment", "call1669"],
        missionAttemptsCount: 2,
        bestOverallScore: 85,
      }),
    ).toMatchObject({ xp: 785, level: 3, xpInLevel: 185 });
  });
});
