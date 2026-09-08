'use client';

import React, { useState } from 'react';
import { MobileContainer } from '@/components/MobileContainer';
import { MascotHeader } from '@/components/MascotHeader';
import { AboutModal } from '@/components/AboutModal';
import { LearningCenter } from '@/features/learning/LearningCenter';
import { SequenceGame } from '@/features/mission/SequenceGame';
import { EmergencyCallSimulation } from '@/features/emergency-call/EmergencyCallSimulation';
import { CPRGame } from '@/features/cpr/CPRGame';
import { AEDSimulation } from '@/features/aed/AEDSimulation';
import { AfterActionReview } from '@/features/debrief/AfterActionReview';
import { ProgressService } from '@/lib/progress';
import { MissionResult, UserProgress, SkillScores, TimelineEntry } from '@/types';
import { 
  BookOpen, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';

type TabType = 'home' | 'learn' | 'mission' | 'about';
type MissionPhase = 'opening' | 'sequence' | 'call1669' | 'cpr' | 'aed' | 'debrief';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [userProgress, setUserProgress] = useState<UserProgress>(() => ProgressService.getProgress());

  // Mission State
  const [missionPhase, setMissionPhase] = useState<MissionPhase>('opening');
  const [sequenceScore, setSequenceScore] = useState<number>(0);
  const [callScore, setCallScore] = useState<number>(0);
  const [cprRhythmScore, setCprRhythmScore] = useState<number>(0);
  const [cprAvgBpm, setCprAvgBpm] = useState<number>(0);
  const [aedScore, setAedScore] = useState<number>(100);
  const [collectedMistakes, setCollectedMistakes] = useState<string[]>([]);
  const [startTimeMs, setStartTimeMs] = useState<number>(0);
  const [currentResult, setCurrentResult] = useState<MissionResult | null>(null);

  const handleStartMission = () => {
    setActiveTab('mission');
    setMissionPhase('opening');
    setSequenceScore(0);
    setCallScore(0);
    setCprRhythmScore(0);
    setCprAvgBpm(0);
    setAedScore(100);
    setCollectedMistakes([]);
    setStartTimeMs(Date.now());
  };

  const handleSequenceComplete = (score: number, mistakes: string[]) => {
    setSequenceScore(score);
    if (mistakes.length > 0) {
      setCollectedMistakes(prev => [...prev, ...mistakes]);
    }
    setMissionPhase('call1669');
  };

  const handleCallComplete = (score: number, mistakes: string[]) => {
    setCallScore(score);
    if (mistakes.length > 0) {
      setCollectedMistakes(prev => [...prev, ...mistakes]);
    }
    setMissionPhase('cpr');
  };

  const handleCprComplete = (rhythmScore: number, avgBpm: number) => {
    setCprRhythmScore(rhythmScore);
    setCprAvgBpm(avgBpm);
    setMissionPhase('aed');
  };

  const handleAedComplete = (score: number, mistakes: string[]) => {
    setAedScore(score);
    if (mistakes.length > 0) {
      setCollectedMistakes(prev => [...prev, ...mistakes]);
    }

    // Build Final Mission Result & Save Progress
    const totalTimeSeconds = Math.max(1, Math.round((Date.now() - startTimeMs) / 1000));
    
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
        skillScores.responseTime) / 6
    );

    const timeline: TimelineEntry[] = [
      { timestamp: '00:00', title: 'พบผู้ประสบเหตุหมดสติ', isSuccess: true },
      { timestamp: '00:04', title: 'ตรวจความปลอดภัยพื้นที่', isSuccess: sequenceScore >= 80 },
      { timestamp: '00:09', title: 'ตรวจการตอบสนอง & เรียกขอความช่วยเหลือ', isSuccess: sequenceScore >= 80 },
      { timestamp: '00:22', title: 'โทรแจ้งเหตุฉุกเฉิน 1669', isSuccess: callScore >= 80, note: `สื่อสารครบ ${callScore}%` },
      { timestamp: '00:35', title: 'เริ่ม CPR กดหน้าอก 30 ครั้ง', isSuccess: cprRhythmScore >= 70, note: `BPM เฉลี่ย ${cprAvgBpm}` },
      { timestamp: '01:15', title: 'เครื่อง AED มาถึงและเปิดใช้งาน', isSuccess: true },
      { timestamp: '01:30', title: 'วิเคราะห์และช็อกไฟฟ้าสำเร็จ', isSuccess: score >= 90 },
    ];

    const result: MissionResult = {
      id: `mission_${Date.now()}`,
      scenarioId: 'SCENARIO_ROTC_01',
      scenarioTitle: 'เพื่อนล้มลงระหว่างการฝึก',
      completedAt: new Date().toLocaleDateString('th-TH'),
      totalTimeSeconds,
      overallScore,
      skillScores,
      timeline,
      cprAverageBpm: cprAvgBpm,
      cprRhythmScore,
      callCompletenessScore: callScore,
      mistakes: collectedMistakes,
    };

    setCurrentResult(result);
    const updatedProg = ProgressService.recordMissionResult(result);
    setUserProgress(updatedProg);
    setMissionPhase('debrief');
  };

  return (
    <MobileContainer
      activeTab={activeTab}
      onTabChange={(tab) => {
        if (tab === 'about') {
          setIsAboutOpen(true);
        } else {
          setActiveTab(tab);
        }
      }}
      onOpenAbout={() => setIsAboutOpen(true)}
    >
      {/* 1. HOME TAB */}
      {activeTab === 'home' && (
        <div className="space-y-5 pb-20">
          {/* Mascot Header */}
          <MascotHeader
            message="วันนี้เราจะฝึกอะไรดี?"
            subtitle="เรียนให้รู้ ฝึกให้พร้อม ช่วยได้เมื่อถึงเวลา"
          />

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Card 1: เรียนรู้ */}
            <div
              onClick={() => setActiveTab('learn')}
              className="group cursor-pointer p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/60 shadow-lg transition-all active:scale-[0.99] flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    1. เรียนรู้
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      Learn
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    ดูวิดีโอและเอกสารก่อนลงภารกิจ
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
            </div>

            {/* Card 2: เริ่มภารกิจ */}
            <div
              onClick={handleStartMission}
              className="group cursor-pointer p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-600/50 hover:border-emerald-400 shadow-xl shadow-emerald-950/60 transition-all active:scale-[0.99] flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    2. เริ่มภารกิจ
                    <span className="text-[10px] text-amber-300 font-mono bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                      Mission
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-200/90">
                    ทดสอบการตัดสินใจในสถานการณ์จำลอง
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </div>

          {/* Current Training Topic Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">หัวข้อการฝึกปัจจุบัน:</span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                CPR ผู้ใหญ่ + AED
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white">สถานการณ์: &ldquo;เพื่อนล้มลงระหว่างการฝึก&rdquo;</div>
              <div className="text-[11px] text-slate-400">
                สนามฝึก นศท. กองพันทหารสารวัตรที่ 11
              </div>
            </div>
          </div>

          {/* Progress Summary Dashboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              ความก้าวหน้าการฝึก (Local Progress)
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/40">
                <div className="text-[10px] text-slate-400">จำนวนลงฝึก</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {userProgress.missionAttemptsCount}
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/40">
                <div className="text-[10px] text-slate-400">คะแนนสูงสุด</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  {userProgress.bestOverallScore}%
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/40">
                <div className="text-[10px] text-slate-400">Rhythm สูงสุด</div>
                <div className="text-lg font-bold text-teal-300 font-mono mt-0.5">
                  {userProgress.bestRhythmScore}%
                </div>
              </div>
            </div>

            {userProgress.lastMissionResult && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">ผลการฝึกครั้งล่าสุด:</span>
                <span className="font-bold text-emerald-300 font-mono">
                  {userProgress.lastMissionResult.overallScore}% ({userProgress.lastMissionResult.completedAt})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. LEARN TAB */}
      {activeTab === 'learn' && (
        <LearningCenter onStartMission={handleStartMission} />
      )}

      {/* 3. MISSION TAB / FLOW */}
      {activeTab === 'mission' && (
        <div className="space-y-4 pb-20">
          {/* Phase 1: Opening Briefing */}
          {missionPhase === 'opening' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-5 rounded-3xl border border-emerald-700/50 space-y-4 text-center shadow-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-950 px-3 py-1 rounded-full border border-amber-800 inline-block">
                  สถานการณ์จำลองการฝึก
                </span>

                <h2 className="text-lg font-black text-white leading-snug">
                  สถานการณ์: &ldquo;เพื่อนล้มลงระหว่างการฝึก&rdquo;
                </h2>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-emerald-200/90 leading-relaxed text-left">
                  &ldquo;นักศึกษาวิชาทหารคนหนึ่งล้มลงบริเวณสนามฝึก กองพันทหารสารวัตรที่ 11 และไม่ตอบสนองเมื่อถูกตบไหล่เรียก...&rdquo;
                </div>

                <div className="text-xs text-slate-300 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>โปรดตัดสินใจทีละขั้นตอนอย่างตั้งสติ</span>
                </div>

                <button
                  onClick={() => setMissionPhase('sequence')}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-950 transition-all flex items-center justify-center gap-2"
                >
                  <span>เริ่มการประเมินลำดับ (Step 1)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: Sequence Game */}
          {missionPhase === 'sequence' && (
            <SequenceGame onCompleteStep={handleSequenceComplete} />
          )}

          {/* Phase 3: Emergency 1669 Call Simulation */}
          {missionPhase === 'call1669' && (
            <EmergencyCallSimulation onCompleteStep={handleCallComplete} />
          )}

          {/* Phase 4: CPR Rhythm Game */}
          {missionPhase === 'cpr' && (
            <CPRGame onCompleteStep={handleCprComplete} />
          )}

          {/* Phase 5: AED Simulation */}
          {missionPhase === 'aed' && (
            <AEDSimulation onCompleteStep={handleAedComplete} />
          )}

          {/* Phase 6: After Action Review (AAR) */}
          {missionPhase === 'debrief' && currentResult && (
            <AfterActionReview
              result={currentResult}
              onRetryMission={handleStartMission}
              onGoHome={() => setActiveTab('home')}
            />
          )}
        </div>
      )}

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </MobileContainer>
  );
}
