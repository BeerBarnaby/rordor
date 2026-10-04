"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MobileContainer } from "@/components/MobileContainer";
import { HomeDashboard, TrainingSteps } from "@/components/HomeDashboard";
import { AboutModal } from "@/components/AboutModal";
import { PlayerModal } from "@/components/PlayerModal";
import { LearningCenter } from "@/features/learning/LearningCenter";
import { SequenceGame } from "@/features/mission/SequenceGame";
import { EmergencyCallSimulation } from "@/features/emergency-call/EmergencyCallSimulation";
import { CPRGame } from "@/features/cpr/CPRGame";
import { AEDSimulation } from "@/features/aed/AEDSimulation";
import { AfterActionReview } from "@/features/debrief/AfterActionReview";
import { ProgressService } from "@/lib/progress";
import { measuredMissionScore, type AEDRecommendation } from "@/lib/aedTraining";
import {
  MissionResult,
  UserProgress,
  SkillScores,
  TimelineEntry,
  LeaderboardEntry,
  PlayerProfile,
} from "@/types";
import { ArrowRight } from "lucide-react";
import { SimulationNotice } from "@/components/TrainingUI";
import { SCENARIO_VARIANTS } from "@/data/scenarios";
import {
  getLeaderboard,
  restorePlayerSession,
  submitMissionToLeaderboard,
} from "@/lib/player";

type TabType = "home" | "learn" | "mission" | "about";
type MissionPhase =
  "opening" | "sequence" | "call1669" | "cpr" | "aed" | "debrief";

function subscribeProgress(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("training-progress", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("training-progress", callback);
  };
}
function progressSnapshot() {
  try {
    return localStorage.getItem("nong_prom_user_progress_v1");
  } catch {
    return null;
  }
}
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const savedProgress = useSyncExternalStore(
    subscribeProgress,
    progressSnapshot,
    () => null,
  );
  const userProgress: UserProgress = React.useMemo(() => {
    if (savedProgress) {
      try {
        return JSON.parse(savedProgress);
      } catch {}
    }
    return {
      completedVideoIds: [],
      completedTopicIds: [],
      missionAttemptsCount: 0,
      bestOverallScore: 0,
      bestRhythmScore: 0,
      lastMissionResult: null,
      history: [],
    };
  }, [savedProgress]);

  // Mission State
  const [missionPhase, setMissionPhase] = useState<MissionPhase>("opening");
  const [sequenceScore, setSequenceScore] = useState<number>(0);
  const [callScore, setCallScore] = useState<number>(0);
  const [cprRhythmScore, setCprRhythmScore] = useState<number>(0);
  const [cprAvgBpm, setCprAvgBpm] = useState<number>(0);
  const [collectedMistakes, setCollectedMistakes] = useState<string[]>([]);
  const [startTimeMs, setStartTimeMs] = useState<number>(0);
  const [currentResult, setCurrentResult] = useState<MissionResult | null>(
    null,
  );
  const [attemptKey, setAttemptKey] = useState(0);
  const actualTimeline = useRef<TimelineEntry[]>([]);
  function recordEvent(title: string, isSuccess: boolean, note?: string) {
    const elapsed = Math.max(0, Math.round((Date.now() - startTimeMs) / 1000));
    actualTimeline.current.push({ timestamp: `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`, title, isSuccess, note });
  }
  const scenario =
    SCENARIO_VARIANTS[
      (Math.max(attemptKey, 1) - 1) % SCENARIO_VARIANTS.length
    ];
  const inProgress = startTimeMs > 0 && missionPhase !== "debrief";
  const playerId = player?.id;
  const latestMissionResult = userProgress.lastMissionResult;
  const focusMode = activeTab === "mission" && inProgress;
  const continueTraining = () => {
    if (inProgress) setActiveTab("mission");
    else handleStartMission();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab, missionPhase]);

  useEffect(() => {
    let active = true;
    Promise.all([restorePlayerSession(), getLeaderboard()]).then(
      ([session, entries]) => {
        if (!active) return;
        setPlayer(session?.profile ?? null);
        setLeaderboard(entries);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // Keep v2 results local until the leaderboard supports separate scoring versions.
    if (!playerId || !latestMissionResult || latestMissionResult.scoringVersion) return;
    void submitMissionToLeaderboard(latestMissionResult).then(async (updatedPlayer) => {
      if (!updatedPlayer) return;
      setPlayer(updatedPlayer);
      setLeaderboard(await getLeaderboard());
    });
  }, [playerId, latestMissionResult]);

  const handleStartMission = () => {
    setActiveTab("mission");
    setAttemptKey((previous) => previous + 1);
    setMissionPhase("opening");
    setSequenceScore(0);
    setCallScore(0);
    setCprRhythmScore(0);
    setCprAvgBpm(0);
    setCollectedMistakes([]);
    actualTimeline.current = [];
    setStartTimeMs(Date.now());
  };

  const handleSequenceComplete = (score: number, mistakes: string[]) => {
    recordEvent('จบแบบฝึกจัดลำดับ', score >= 80);
    setSequenceScore(score);
    if (mistakes.length > 0) {
      setCollectedMistakes((prev) => [...prev, ...mistakes]);
    }
    setMissionPhase("call1669");
  };

  const handleCallComplete = (score: number, mistakes: string[]) => {
    recordEvent('จบการแจ้งเหตุจำลอง 1669', score >= 80, `ข้อมูลครบ ${score}%`);
    setCallScore(score);
    if (mistakes.length > 0) {
      setCollectedMistakes((prev) => [...prev, ...mistakes]);
    }
    setMissionPhase("cpr");
  };

  const handleCprComplete = (rhythmScore: number, avgBpm: number) => {
    recordEvent('จบการฝึกจังหวะด้วยการแตะ', rhythmScore >= 70, `จังหวะเฉลี่ย ${avgBpm} ครั้ง/นาที`);
    setCprRhythmScore(rhythmScore);
    setCprAvgBpm(avgBpm);
    setMissionPhase("aed");
  };

  const handleAedComplete = (recommendation: AEDRecommendation) => {
    recordEvent('ทบทวน AED ครบ', true, recommendation === 'shock' ? 'เครื่องจำลองแนะนำช็อก' : 'เครื่องจำลองไม่แนะนำช็อก');

    // Build Final Mission Result & Save Progress
    const totalTimeSeconds = Math.max(
      1,
      Math.round((Date.now() - startTimeMs) / 1000),
    );

    const skillScores: SkillScores = {
      assessment: null,
      sequence: sequenceScore,
      cprRhythm: cprRhythmScore,
      call1669: callScore,
      aed: null,
      responseTime: null,
    };

    const overallScore = measuredMissionScore(sequenceScore, callScore, cprRhythmScore);

    const timeline = [...actualTimeline.current];

    const result: MissionResult = {
      scoringVersion: 'measured-v2',
      aedRecommendation: recommendation,
      id: `mission_${Date.now()}`,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      completedAt: new Date().toLocaleDateString("th-TH"),
      totalTimeSeconds,
      overallScore,
      skillScores,
      timeline,
      cprAverageBpm: cprAvgBpm,
      cprRhythmScore,
      callCompletenessScore: callScore,
      mistakes: [...collectedMistakes],
    };

    setCurrentResult(result);
    ProgressService.recordMissionResult(result);
    setMissionPhase("debrief");
  };

  return (
    <MobileContainer
      activeTab={activeTab}
      onTabChange={(tab) => {
        if (tab === "about") {
          setIsAboutOpen(true);
        } else if (tab === "mission" && startTimeMs === 0) {
          handleStartMission();
        } else {
          setActiveTab(tab);
        }
      }}
      onOpenAbout={() => setIsAboutOpen(true)}
      onOpenPlayer={() => setIsPlayerOpen(true)}
      playerName={player?.displayName}
      focusMode={focusMode}
      trainingTone={missionPhase === "aed" ? "aed" : "standard"}
      onExitTraining={() => setActiveTab("home")}
    >
      {/* 1. HOME TAB */}
      {activeTab === "home" && (
        <HomeDashboard
          progress={userProgress}
          onLearn={() => setActiveTab("learn")}
          onStart={continueTraining}
          leaderboard={leaderboard}
          player={player}
          onOpenPlayer={() => setIsPlayerOpen(true)}
          currentStep={
            inProgress
              ? Math.max(
                  0,
                  ["sequence", "call1669", "cpr", "aed"].indexOf(missionPhase),
                )
              : undefined
          }
        />
      )}

      {/* 2. LEARN TAB */}
      {activeTab === "learn" && (
        <LearningCenter progress={userProgress} onStartMission={continueTraining} />
      )}

      {/* 3. MISSION TAB / FLOW */}
      {startTimeMs > 0 && (
        <div key={attemptKey} hidden={activeTab !== "mission"}>
          {missionPhase !== "opening" && missionPhase !== "debrief" && (
            <div>
              <TrainingSteps
                current={["sequence", "call1669", "cpr", "aed"].indexOf(
                  missionPhase,
                )}
              />
            </div>
          )}
          {missionPhase === "opening" && (
            <div className="page-stack training-screen">
              <header>
                <p className="protocol-code">{scenario.code} · CPR + AED</p>
                <h1 className="display-title">
                  เพื่อนล้มลง
                  <br />
                  คุณอยู่ใกล้ที่สุด
                </h1>
                <p className="lead mt-5">
                  {scenario.opening}
                </p>
              </header>
              <section className="conversation-prompt">
                <p className="protocol-code">โจทย์ของคุณ</p>
                <blockquote>ตัดสินใจให้ถูก แล้วช่วยเหลือตามลำดับ</blockquote>
              </section>
              <p className="caption">
                ใช้เวลาประมาณ 5 นาที · มีคำแนะนำหลังทุกคำตอบ · ผลเก็บไว้ในอุปกรณ์นี้
              </p>
              <SimulationNotice />
              <button
                className="primary-button self-start"
                onClick={() => {
                  setStartTimeMs(Date.now());
                  actualTimeline.current = [{ timestamp: '00:00', title: 'เริ่มสถานการณ์จำลอง', isSuccess: true }];
                  setMissionPhase("sequence");
                }}
              >
                เริ่มฝึกสถานการณ์
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* Phase 2: Sequence Game */}
          {missionPhase === "sequence" && (
            <SequenceGame onCompleteStep={handleSequenceComplete} />
          )}

          {/* Phase 3: Emergency 1669 Call Simulation */}
          {missionPhase === "call1669" && (
            <EmergencyCallSimulation
              scenario={scenario}
              onCompleteStep={handleCallComplete}
            />
          )}

          {/* Phase 4: CPR Rhythm Game */}
          {missionPhase === "cpr" && (
            <CPRGame onCompleteStep={handleCprComplete} />
          )}

          {/* Phase 5: AED Simulation */}
          {missionPhase === "aed" && (
            <AEDSimulation onCompleteStep={handleAedComplete} active={activeTab === 'mission'} recommendation={attemptKey % 2 === 0 ? 'no-shock' : 'shock'} />
          )}

          {/* Phase 6: After Action Review (AAR) */}
          {missionPhase === "debrief" && currentResult && (
            <AfterActionReview
              result={currentResult}
              onRetryMission={handleStartMission}
              onGoHome={() => setActiveTab("home")}
              onLearn={() => setActiveTab("learn")}
            />
          )}
        </div>
      )}

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <PlayerModal
        open={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        player={player}
        onPlayerChange={(nextPlayer) => {
          setPlayer(nextPlayer);
        }}
      />
    </MobileContainer>
  );
}
