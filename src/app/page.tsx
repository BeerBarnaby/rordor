'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
          {/* Hero Card */}
          <MascotHeader />

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Card 1: เรียนรู้ */}
            <div
              onClick={() => setActiveTab('learn')}
              className="group cursor-pointer p-4 rounded-2xl bg-white border border-[#D8E4DE] hover:border-[#0F5C4D]/40 shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#DFF4EC] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                  <Image src="/icon-learn.png" alt="ไอคอนคลังการเรียนรู้" width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#17221E] group-hover:text-[#0F5C4D] transition-colors">
                    เรียนรู้
                  </h3>
                  <p className="text-xs text-[#5C6B65]">
                    ดูวิดีโอและเอกสารประกอบ
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#D8E4DE] group-hover:text-[#0F5C4D] transition-colors shrink-0" />
            </div>

            {/* Card 2: เริ่มภารกิจ */}
            <div
              onClick={handleStartMission}
              className="group cursor-pointer p-4 rounded-2xl bg-[#0F5C4D] hover:bg-[#0a4a3d] shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                  <Image src="/icon-mission.png" alt="ไอคอนเริ่มภารกิจ" width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white">
                    เริ่มภารกิจ
                  </h3>
                  <p className="text-xs text-white/80">
                    ฝึกตัดสินใจผ่านสถานการณ์จำลอง
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </div>

          {/* Current Training Topic Section */}
          <div className="bg-white border border-[#D8E4DE] rounded-2xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17221E]">หัวข้อฝึกปัจจุบัน</span>
              <span className="text-[11px] text-[#0F5C4D] font-semibold bg-[#DFF4EC] px-2.5 py-0.5 rounded-lg border border-[#D8E4DE]">
                CPR ผู้ใหญ่ + AED
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#D8E4DE] text-xs text-[#5C6B65] space-y-1">
              <div className="font-semibold text-[#17221E]">สถานการณ์: &ldquo;เพื่อนล้มลงระหว่างการฝึก&rdquo;</div>
              <div className="text-[#5C6B65]">
                หน่วยฝึก: ROTC37 • ศูนย์วันอังคาร รร.วิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย
              </div>
            </div>
          </div>

          {/* Progress Summary Dashboard */}
          <div className="bg-white border border-[#D8E4DE] rounded-2xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-[#17221E] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#0F5C4D]" />
              ความก้าวหน้าการฝึก
            </h3>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#D8E4DE]">
                <div className="text-[11px] text-[#5C6B65]">จำนวนครั้งที่ฝึก</div>
                <div className="text-lg font-bold text-[#17221E] font-mono mt-0.5">
                  {userProgress.missionAttemptsCount}
                </div>
              </div>

              <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#D8E4DE]">
                <div className="text-[11px] text-[#5C6B65]">คะแนนสูงสุด</div>
                <div className="text-lg font-bold text-[#0F5C4D] font-mono mt-0.5">
                  {userProgress.bestOverallScore}%
                </div>
              </div>

              <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#D8E4DE]">
                <div className="text-[11px] text-[#5C6B65]">Rhythm สูงสุด</div>
                <div className="text-lg font-bold text-[#0F5C4D] font-mono mt-0.5">
                  {userProgress.bestRhythmScore}%
                </div>
              </div>
            </div>

            {userProgress.lastMissionResult && (
              <div className="pt-2 border-t border-[#D8E4DE] flex items-center justify-between text-xs">
                <span className="text-[#5C6B65]">ผลการฝึกครั้งล่าสุด:</span>
                <span className="font-bold text-[#0F5C4D] font-mono">
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
              <div className="bg-white p-5 rounded-2xl border border-[#D8E4DE] space-y-4 text-center shadow-sm">
                <span className="text-[11px] font-bold text-[#F4A63D] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                  สถานการณ์จำลองการฝึก
                </span>

                <h2 className="text-lg font-extrabold text-[#17221E] leading-snug">
                  สถานการณ์: &ldquo;เพื่อนล้มลงระหว่างการฝึก&rdquo;
                </h2>

                <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#D8E4DE] text-sm text-[#5C6B65] leading-relaxed text-left">
                  &ldquo;นักศึกษาวิชาทหารคนหนึ่งล้มลงระหว่างการฝึก ณ ศูนย์วันอังคาร โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย (หน่วยฝึก นศท. มทบ.37) และไม่ตอบสนองเมื่อถูกตบไหล่เรียก...&rdquo;
                </div>

                <div className="text-xs text-[#5C6B65] flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0F5C4D]" />
                  <span>โปรดตัดสินใจทีละขั้นตอนอย่างตั้งสติ</span>
                </div>

                <button
                  onClick={() => setMissionPhase('sequence')}
                  className="w-full py-3.5 rounded-xl bg-[#0F5C4D] hover:bg-[#0a4a3d] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>เริ่มการประเมินลำดับ</span>
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
