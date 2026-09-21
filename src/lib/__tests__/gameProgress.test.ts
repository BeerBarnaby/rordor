import { describe, expect, it } from "vitest";
import { getGameProgress } from "../gameProgress";
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
  it("calculates xp with the same mission formula as the leaderboard", () => {
    expect(
      getGameProgress({
        ...baseProgress,
        completedTopicIds: ["assessment", "call1669"],
        missionAttemptsCount: 2,
        bestOverallScore: 85,
      }),
    ).toMatchObject({
      xp: 585,
      level: 2,
      xpInLevel: 285,
      completedTopicCount: 2,
    });
  });

  it("counts only unique known lessons", () => {
    expect(
      getGameProgress({
        ...baseProgress,
        completedTopicIds: ["aed", "aed", "unknown"],
      }).completedTopicCount,
    ).toBe(1);
  });

  it("clamps invalid progress and caps the level", () => {
    expect(
      getGameProgress({
        ...baseProgress,
        missionAttemptsCount: 99,
        bestOverallScore: 999,
      }),
    ).toMatchObject({ level: 10, xpInLevel: 300 });

    expect(
      getGameProgress({
        ...baseProgress,
        missionAttemptsCount: Number.NaN,
        bestOverallScore: -50,
      }),
    ).toMatchObject({ xp: 0, level: 1, xpInLevel: 0 });
  });
});
