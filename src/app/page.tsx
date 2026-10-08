"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from 'next/image';
import { MobileContainer } from "@/components/MobileContainer";
import { HomeDashboard, TrainingSteps } from "@/components/HomeDashboard";
import { AboutModal } from "@/components/AboutModal";
import { PlayerModal } from "@/components/PlayerModal";
import { LearningCenter } from "@/features/learning/LearningCenter";
import { SequenceGame } from "@/features/mission/SequenceGame";
import { EmergencyCallSimulation } from "@/features/emergency-call/EmergencyCallSimulation";
import { CPRGame } from "@/features/cpr/CPRGame";
import { AEDPractice } from '@/features/aed/AEDPractice';
import { AppDialog } from '@/components/AppDialog';
import { AfterActionReview } from "@/features/debrief/AfterActionReview";
import { ProgressService } from "@/lib/progress";
import { measuredMissionScore } from "@/lib/aedTraining";
import { enqueueAttempt } from '@/lib/attemptOutbox';
import { useAttemptSync } from '@/lib/useAttemptSync';
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
} from "@/lib/player";

type TabType = "home" | "learn" | "mission" | "about";
type MissionPhase =
  "opening" | "sequence" | "call1669" | "cpr" | "debrief";

function subscribeProgress(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("training-progress", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("training-progress", callback);
  };
}
function progressSnapshot() {
  return ProgressService.snapshot();
}
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [standaloneAED, setStandaloneAED] = useState(false);
  const [missionMenu, setMissionMenu] = useState(false);
  const [learningTopic, setLearningTopic] = useState<string | null>(null);
  const [exitConfirmation, setExitConfirmation] = useState(false);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardGuided, setLeaderboardGuided] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState('');
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [queueWarning, setQueueWarning] = useState('');
  const savedProgress = useSyncExternalStore(
    subscribeProgress,
    progressSnapshot,
    () => null,
  );
  const userProgress: UserProgress = React.useMemo(() => {
    return ProgressService.parseProgress(savedProgress);
  }, [savedProgress]);

  // Mission State
  const [missionPhase, setMissionPhase] = useState<MissionPhase>("opening");
  const [sequenceScore, setSequenceScore] = useState<number>(0);
  const [callScore, setCallScore] = useState<number>(0);
  const [collectedMistakes, setCollectedMistakes] = useState<string[]>([]);
  const [startTimeMs, setStartTimeMs] = useState<number>(0);
  const [currentResult, setCurrentResult] = useState<MissionResult | null>(
    null,
  );
  const [attemptKey, setAttemptKey] = useState(0);
  const actualTimeline = useRef<TimelineEntry[]>([]);
  const missionOwner = useRef<string | undefined>(undefined);
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
  const onlineSync = useAttemptSync(playerId, (updated) => {
    setPlayer(updated);
    setLeaderboardLoading(true);
    setLeaderboardRefresh(value => value + 1);
  });
  const focusMode = activeTab === "mission" && !missionMenu && (inProgress || standaloneAED);
  const continueTraining = () => {
    setMissionMenu(false);
    setStandaloneAED(false);
    if (inProgress) setActiveTab("mission");
    else handleStartMission();
  };
  const startAEDMission = () => {
    setMissionMenu(false);
    setStandaloneAED(true);
    setActiveTab('mission');
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab, missionPhase]);

  useEffect(() => {
    let active = true;
    const restore = () => restorePlayerSession().then(
      (session) => {
        if (!active) return;
        setPlayer(session?.profile ?? null);
      },
    ).catch(() => { /* Guest training stays available when the network fails. */ });
    void restore();
    window.addEventListener('online', restore);
    return () => {
      active = false;
      window.removeEventListener('online', restore);
    };
  }, []);

  useEffect(() => {
    let active = true;
    getLeaderboard(leaderboardGuided).then(entries => {
      if (active) { setLeaderboard(entries); setLeaderboardError(''); }
    }).catch(() => {
      if (active) { setLeaderboard([]); setLeaderboardError('ยังโหลดอันดับออนไลน์ไม่ได้ ลองใหม่ได้ โดยยังฝึกต่อได้ตามปกติ'); }
    }).finally(() => { if (active) setLeaderboardLoading(false); });
    return () => { active = false; };
  }, [leaderboardGuided, leaderboardRefresh]);

  const handleStartMission = () => {
    missionOwner.current = player?.id;
    setQueueWarning('');
    setMissionMenu(false);
    setStandaloneAED(false);
    setActiveTab("mission");
    setAttemptKey((previous) => previous + 1);
    setMissionPhase("opening");
    setSequenceScore(0);
    setCallScore(0);
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

  const handleCprComplete = (rhythmScore: number, avgBpm: number, audioGuided = false) => {
    recordEvent('จบการฝึกจังหวะด้วยการแตะ', rhythmScore >= 70, `จังหวะเฉลี่ย ${avgBpm} ครั้ง/นาที`);
    finishMainMission(rhythmScore, avgBpm, audioGuided);
  };

  const finishMainMission = (rhythmScore: number, avgBpm: number, audioGuided: boolean) => {

    // Build Final Mission Result & Save Progress
    const totalTimeSeconds = Math.max(
      1,
      Math.round((Date.now() - startTimeMs) / 1000),
    );

    const skillScores: SkillScores = {
      assessment: null,
      sequence: sequenceScore,
      cprRhythm: rhythmScore,
      call1669: callScore,
      aed: null,
      responseTime: null,
    };

    const overallScore = measuredMissionScore(sequenceScore, callScore, rhythmScore);

    const timeline = [...actualTimeline.current];

    const result: MissionResult = {
      playerId: missionOwner.current,
      scoringVersion: 'measured-v2',
      cprAudioGuided: audioGuided,
      id: `mission_${Date.now()}`,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      completedAt: new Date().toLocaleDateString("th-TH"),
      totalTimeSeconds,
      overallScore,
      skillScores,
      timeline,
      cprAverageBpm: avgBpm,
      cprRhythmScore: rhythmScore,
      callCompletenessScore: callScore,
      mistakes: [...collectedMistakes],
    };

    setCurrentResult(result);
    ProgressService.recordMissionResult(result);
    if (!ProgressService.isPersisted()) setQueueWarning('เบราว์เซอร์บันทึกผลไม่ได้ ผลอยู่เฉพาะหน้านี้ อย่าปิดหน้าจนกว่าจะเก็บผลได้');
    if (result.playerId) {
      const queued = enqueueAttempt(result);
      if (!queued.queued) setQueueWarning('ผลยังอยู่ในหน้านี้ แต่ยังเข้าคิวออนไลน์ไม่ได้ กรุณาตรวจเวลาและจำนวนผลที่รอส่ง');
      else if (!queued.durable) setQueueWarning('เบราว์เซอร์บันทึกคิวไม่ได้ อย่าปิดหน้านี้ก่อนส่งคะแนนสำเร็จ');
    }
    setMissionPhase("debrief");
  };

  return (
    <MobileContainer
      activeTab={activeTab}
      onTabChange={(tab) => {
        if (tab === "about") {
          setIsAboutOpen(true);
        } else if (tab === "mission") {
          setMissionMenu(true);
          setActiveTab('mission');
        } else {
          if (tab === 'learn') setLearningTopic(null);
          setActiveTab(tab);
        }
      }}
      onOpenAbout={() => setIsAboutOpen(true)}
      onOpenPlayer={() => setIsPlayerOpen(true)}
      playerName={player?.displayName}
      focusMode={focusMode}
      trainingTone={standaloneAED ? "aed" : "standard"}
      onExitTraining={() => setExitConfirmation(true)}
    >
      {/* 1. HOME TAB */}
      {activeTab === "home" && (
        <HomeDashboard
          progress={userProgress}
          onLearn={() => { setLearningTopic(null); setActiveTab("learn"); }}
          onStart={continueTraining}
          leaderboard={leaderboard}
          player={player}
          onOpenPlayer={() => setIsPlayerOpen(true)}
          leaderboardGuided={leaderboardGuided}
          onLeaderboardMode={(guided) => { if (guided !== leaderboardGuided) { setLeaderboardLoading(true); setLeaderboardGuided(guided); } }}
          leaderboardLoading={leaderboardLoading}
          leaderboardError={leaderboardError}
          onReloadLeaderboard={() => { setLeaderboardLoading(true); setLeaderboardRefresh(value => value + 1); }}
          syncMessage={queueWarning || onlineSync.status.message}
          pendingCount={onlineSync.pendingCount}
          onRetrySync={onlineSync.retry}
          currentStep={
            inProgress
              ? Math.max(
                  0,
                  ["sequence", "call1669", "cpr"].indexOf(missionPhase),
                )
              : undefined
          }
        />
      )}

      {/* 2. LEARN TAB */}
      {activeTab === "learn" && (
        <LearningCenter progress={userProgress} initialTopic={learningTopic} onStartMission={continueTraining} onPracticeAED={startAEDMission} />
      )}

      {/* 3. MISSION TAB / FLOW */}
      {activeTab === 'mission' && missionMenu && <section className="page-stack training-screen">
        <header><p className="protocol-code">ฝึกสถานการณ์</p><h1 className="page-title">เลือกภารกิจที่อยากฝึก</h1><p className="body-copy">เริ่มจากภารกิจหลัก หรือเลือกฝึก AED เพิ่มเติมได้โดยไม่ต้องเข้าสู่ระบบ</p></header>
        <section className="page-stack" aria-labelledby="core-mission-title">
          <h2 id="core-mission-title" className="section-title">ภารกิจหลัก · ช่วยเพื่อนหมดสติ</h2>
          <p>ประเมินเหตุ → แจ้งเหตุ 1669 → ฝึกจังหวะ CPR</p>
          <p className="caption">3 ขั้น · ประมาณ 5 นาที · มีสรุปผลหลังฝึก</p>
          <button className="primary-button" onClick={continueTraining}>{inProgress ? 'ฝึกภารกิจหลักต่อ' : 'เริ่มภารกิจหลัก'}<ArrowRight size={20} aria-hidden="true" /></button>
        </section>
        <section className="page-stack" aria-labelledby="aed-mission-title">
          <h2 id="aed-mission-title" className="section-title">ภารกิจเสริม · ใช้เครื่อง AED</h2>
          <Image src="/images/training/prom-aed-clear-v1.png" width={1536} height={1024} sizes="(min-width: 768px) 360px, 280px" className="optional-mission-image" alt="ตัวละครนักศึกษาวิชาทหารเคลียร์พื้นที่ข้างหุ่นฝึกและเครื่อง AED จำลอง" />
          <p>ฝึกเปิดเครื่อง ติดแผ่น เคลียร์พื้นที่ และทำตามผลวิเคราะห์ ทั้งกรณีแนะนำให้ช็อกและไม่แนะนำให้ช็อก</p>
          <p className="caption">เลือกฝึกได้เมื่อสนใจ · ไม่จำเป็นต้องผ่านเพื่อจบภารกิจหลัก · ไม่เพิ่ม XP</p>
          <button className="secondary-button" onClick={startAEDMission}>เริ่มภารกิจ AED<ArrowRight size={20} aria-hidden="true" /></button>
        </section>
        <SimulationNotice />
      </section>}
      {standaloneAED && <div hidden={activeTab !== 'mission' || missionMenu}><AEDPractice active={activeTab === 'mission' && !missionMenu && !exitConfirmation} onClose={() => { setStandaloneAED(false); setMissionMenu(true); }} /></div>}
      {startTimeMs > 0 && (
        <div key={attemptKey} hidden={activeTab !== "mission" || standaloneAED || missionMenu}>
          {missionPhase !== "opening" && missionPhase !== "debrief" && (
            <div>
              <TrainingSteps
                current={["sequence", "call1669", "cpr"].indexOf(
                  missionPhase,
                )}
              />
            </div>
          )}
          {missionPhase === "opening" && (
            <div className="page-stack training-screen">
              <header>
                <p className="protocol-code">{scenario.code} · โทร 1669 + CPR</p>
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
            <CPRGame onCompleteStep={handleCprComplete} active={activeTab === 'mission' && !missionMenu && !standaloneAED && !exitConfirmation} />
          )}

          {/* Phase 6: After Action Review (AAR) */}
          {missionPhase === "debrief" && currentResult && (
            <AfterActionReview
              result={currentResult}
              onRetryMission={handleStartMission}
              onGoHome={() => setActiveTab("home")}
              onLearn={(topic) => { setLearningTopic(topic ?? null); setActiveTab("learn"); }}
              syncMessage={queueWarning || (currentResult.playerId === playerId ? onlineSync.status.message : '')}
              pendingCount={currentResult.playerId === playerId ? onlineSync.pendingCount : 0}
              onRetrySync={onlineSync.retry}
            />
          )}
        </div>
      )}

      {/* About Modal */}
      <AppDialog open={exitConfirmation} onClose={() => setExitConfirmation(false)} title="ออกจากการฝึก?">
        <div className="dialog-body page-stack"><p>{standaloneAED ? 'โหมดทบทวนไม่บันทึกคะแนน เมื่อกลับเข้ามาจะเริ่มใหม่' : 'พักการฝึกไว้ก่อนได้ ขั้นตอนนี้จะยังไม่ถือว่าฝึกจบ'}</p><button className="primary-button" onClick={() => setExitConfirmation(false)}>ฝึกต่อ</button><button className="secondary-button" onClick={() => { setExitConfirmation(false); setStandaloneAED(false); setActiveTab('home'); }}>กลับหน้าแรก</button></div>
      </AppDialog>
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
