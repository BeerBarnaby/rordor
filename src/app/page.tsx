"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { MobileContainer } from "@/components/MobileContainer";
import { HomeDashboard, TrainingSteps } from "@/components/HomeDashboard";
import { AboutModal } from "@/components/AboutModal";
import { LearningCenter } from "@/features/learning/LearningCenter";
import { SequenceGame } from "@/features/mission/SequenceGame";
import { EmergencyCallSimulation } from "@/features/emergency-call/EmergencyCallSimulation";
import { CPRGame } from "@/features/cpr/CPRGame";
import { AEDSimulation } from "@/features/aed/AEDSimulation";
import { AfterActionReview } from "@/features/debrief/AfterActionReview";
import { ProgressService } from "@/lib/progress";
import {
  MissionResult,
  UserProgress,
  SkillScores,
  TimelineEntry,
} from "@/types";
import { ArrowRight } from "lucide-react";
import { SimulationNotice } from "@/components/TrainingUI";
import { SCENARIO_VARIANTS } from "@/data/scenarios";

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
  const scenario =
    SCENARIO_VARIANTS[
      (Math.max(attemptKey, 1) - 1) % SCENARIO_VARIANTS.length
    ];
  const inProgress = startTimeMs > 0 && missionPhase !== "debrief";
  const focusMode = activeTab === "mission" && inProgress;
  const continueTraining = () => {
    if (inProgress) setActiveTab("mission");
    else handleStartMission();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab, missionPhase]);

  const handleStartMission = () => {
    setActiveTab("mission");
    setAttemptKey((previous) => previous + 1);
    setMissionPhase("opening");
    setSequenceScore(0);
    setCallScore(0);
    setCprRhythmScore(0);
    setCprAvgBpm(0);
    setCollectedMistakes([]);
    setStartTimeMs(Date.now());
  };

  const handleSequenceComplete = (score: number, mistakes: string[]) => {
    setSequenceScore(score);
    if (mistakes.length > 0) {
      setCollectedMistakes((prev) => [...prev, ...mistakes]);
    }
    setMissionPhase("call1669");
  };

  const handleCallComplete = (score: number, mistakes: string[]) => {
    setCallScore(score);
    if (mistakes.length > 0) {
      setCollectedMistakes((prev) => [...prev, ...mistakes]);
    }
    setMissionPhase("cpr");
  };

  const handleCprComplete = (rhythmScore: number, avgBpm: number) => {
    setCprRhythmScore(rhythmScore);
    setCprAvgBpm(avgBpm);
    setMissionPhase("aed");
  };

  const handleAedComplete = (score: number, mistakes: string[]) => {
    if (mistakes.length > 0) {
      setCollectedMistakes((prev) => [...prev, ...mistakes]);
    }

    // Build Final Mission Result & Save Progress
    const totalTimeSeconds = Math.max(
      1,
      Math.round((Date.now() - startTimeMs) / 1000),
    );

    const skillScores: SkillScores = {
      assessment: sequenceScore >= 80 ? 95 : 70,
      sequence: sequenceScore,
      cprRhythm: cprRhythmScore,
      call1669: callScore,
      aed: score,
      responseTime: totalTimeSeconds <= 120 ? 90 : 75,
    };

    const overallScore = Math.round(
      (skillScores.assessment +
        skillScores.sequence +
        skillScores.cprRhythm +
        skillScores.call1669 +
        skillScores.aed +
        skillScores.responseTime) /
        6,
    );

    const timeline: TimelineEntry[] = [
      { timestamp: "00:00", title: "พบผู้ประสบเหตุหมดสติ", isSuccess: true },
      {
        timestamp: "00:04",
        title: "ตรวจความปลอดภัยพื้นที่",
        isSuccess: sequenceScore >= 80,
      },
      {
        timestamp: "00:09",
        title: "ตรวจการตอบสนอง & เรียกขอความช่วยเหลือ",
        isSuccess: sequenceScore >= 80,
      },
      {
        timestamp: "00:22",
        title: "โทรแจ้งเหตุฉุกเฉิน 1669",
        isSuccess: callScore >= 80,
        note: `สื่อสารครบ ${callScore}%`,
      },
      {
        timestamp: "00:35",
        title: "เริ่ม CPR กดหน้าอก 30 ครั้ง",
        isSuccess: cprRhythmScore >= 70,
        note: `BPM เฉลี่ย ${cprAvgBpm}`,
      },
      {
        timestamp: "01:15",
        title: "เครื่อง AED มาถึงและเปิดใช้งาน",
        isSuccess: true,
      },
      {
        timestamp: "01:30",
        title: "วิเคราะห์และช็อกไฟฟ้าสำเร็จ",
        isSuccess: score >= 90,
      },
    ];

    const result: MissionResult = {
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
      mistakes: [...collectedMistakes, ...mistakes],
    };

    setCurrentResult(result);
    ProgressService.recordMissionResult(result);
    window.dispatchEvent(new Event("training-progress"));
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
      focusMode={focusMode}
      onExitTraining={() => setActiveTab("home")}
    >
      {/* 1. HOME TAB */}
      {activeTab === "home" && (
        <HomeDashboard
          progress={userProgress}
          onLearn={() => setActiveTab("learn")}
          onStart={continueTraining}
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
        <LearningCenter onStartMission={continueTraining} />
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
                className="primary-button"
                onClick={() => {
                  setStartTimeMs(Date.now());
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
            <AEDSimulation onCompleteStep={handleAedComplete} />
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
    </MobileContainer>
  );
}
