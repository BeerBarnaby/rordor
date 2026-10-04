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
import { parseProgress } from '@/lib/progressValidation';
import { DRAFT_KEY, parseMissionDraft } from '@/lib/missionDraft';
import { readNavigation, navigationSnapshot, subscribeNavigation, navigateTo } from '@/lib/lessonNavigation';
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
function draftSnapshot() {
  try { return localStorage.getItem(DRAFT_KEY); } catch { return null; }
}
export default function Home() {
  const navigationHash = useSyncExternalStore(subscribeNavigation, navigationSnapshot, () => '');
  const { tab: activeTab, selectedLesson } = readNavigation(navigationHash);
  function setActiveTab(tab: TabType) {
    navigateTo(tab === 'learn' ? '#lessons' : tab === 'mission' ? '#practice' : '#home');
  }
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  async function refreshLeaderboard() {
    setLeaderboardStatus('loading');
    try { setLeaderboard(await getLeaderboard()); setLeaderboardStatus('ready'); }
    catch { setLeaderboardStatus('error'); }
  }
  const savedProgress = useSyncExternalStore(
    subscribeProgress,
    progressSnapshot,
    () => null,
  );
  const userProgress: UserProgress = React.useMemo(() => parseProgress(savedProgress), [savedProgress]);
  const savedDraft = useSyncExternalStore(subscribeProgress, draftSnapshot, () => null);
  const checkpoint = React.useMemo(() => parseMissionDraft(savedDraft), [savedDraft]);

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
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    if (!startTimeMs) return;
    try {
      if (missionPhase === 'debrief') localStorage.removeItem(DRAFT_KEY);
      else localStorage.setItem(DRAFT_KEY, JSON.stringify({
        version: 1, phase: missionPhase, attemptKey, sequenceScore, callScore,
        cprRhythmScore, cprAvgBpm, mistakes: collectedMistakes,
        elapsedSeconds: Math.min(86400, Math.max(0, (Date.now() - startTimeMs) / 1000)),
      }));
      window.dispatchEvent(new Event('training-progress'));
    } catch { /* Private browsing/storage limits must not stop training. */ }
  }, [missionPhase, attemptKey, sequenceScore, callScore, cprRhythmScore, cprAvgBpm, collectedMistakes, startTimeMs]);
  function resumeCheckpoint() {
    if (!checkpoint) return;
    setAttemptKey(checkpoint.attemptKey);
    setSequenceScore(checkpoint.sequenceScore);
    setCallScore(checkpoint.callScore);
    setCprRhythmScore(checkpoint.cprRhythmScore);
    setCprAvgBpm(checkpoint.cprAvgBpm);
    setCollectedMistakes(checkpoint.mistakes);
    setStartTimeMs(Date.now() - checkpoint.elapsedSeconds * 1000);
    actualTimeline.current = [{timestamp: '—', title: 'กลับมาฝึกต่อจากต้นกิจกรรมที่บันทึกไว้', isSuccess: true, note: 'เวลาและคำตอบย่อยของกิจกรรมที่ค้างไม่ถูกกู้คืน'}];
    setMissionPhase(checkpoint.phase);
    setActiveTab('mission');
  }
  const continueTraining = () => {
    if (inProgress) setActiveTab("mission");
    else if (checkpoint) resumeCheckpoint();
    else handleStartMission();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab, missionPhase]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([restorePlayerSession(), getLeaderboard()]).then(
      ([session, entries]) => {
        if (!active) return;
        setPlayer(session.status === 'fulfilled' ? session.value?.profile ?? null : null);
        if (entries.status === 'fulfilled') { setLeaderboard(entries.value); setLeaderboardStatus('ready'); }
        else setLeaderboardStatus('error');
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
      await refreshLeaderboard();
    }).catch(() => { /* Results remain in local progress if the network fails. */ });
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
          onOpenLesson={id => navigateTo(`#lessons/${id}`)}
          onStart={continueTraining}
          hasSavedMission={!inProgress && Boolean(checkpoint)}
          onNewMission={() => { if (window.confirm('เริ่มภารกิจใหม่แทนกิจกรรมที่ค้างไว้? ผลกิจกรรมที่จบแล้วและประวัติเดิมจะไม่ถูกลบ')) handleStartMission(); }}
          leaderboard={leaderboard}
          leaderboardStatus={leaderboardStatus}
          onRetryLeaderboard={refreshLeaderboard}
          player={player}
          onOpenPlayer={() => setIsPlayerOpen(true)}
          currentStep={
            inProgress
              ? Math.max(
                  0,
                  ["sequence", "call1669", "cpr", "aed"].indexOf(missionPhase),
                )
              : checkpoint ? Math.max(0, ['sequence','call1669','cpr','aed'].indexOf(checkpoint.phase)) : undefined
          }
        />
      )}

      {/* 2. LEARN TAB */}
      {activeTab === "learn" && (
        <LearningCenter progress={userProgress} onStartMission={continueTraining} selected={selectedLesson} onSelect={id => navigateTo(id ? `#lessons/${id}` : '#lessons')} />
      )}

      {/* 3. MISSION TAB / FLOW */}
      {(startTimeMs > 0 || activeTab === 'mission') && (
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
              {!startTimeMs && checkpoint && <button className="secondary-button" onClick={resumeCheckpoint}>กลับมาฝึกต่อจากกิจกรรมที่บันทึกไว้</button>}
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
            <CPRGame onCompleteStep={handleCprComplete} active={activeTab === 'mission' && pageVisible} />
          )}

          {/* Phase 5: AED Simulation */}
          {missionPhase === "aed" && (
            <AEDSimulation onCompleteStep={handleAedComplete} active={activeTab === 'mission' && pageVisible} recommendation={attemptKey % 2 === 0 ? 'no-shock' : 'shock'} />
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
