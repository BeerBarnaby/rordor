'use client';

import React, { useState } from 'react';
import { MissionResult } from '@/types';
import { Award, RotateCcw, Home, ShieldAlert, Clock, Activity, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AfterActionReviewProps {
  result: MissionResult;
  onRetryMission: () => void;
  onGoHome: () => void;
}

export const AfterActionReview: React.FC<AfterActionReviewProps> = ({
  result,
  onRetryMission,
  onGoHome,
}) => {
  const [showMistakesOnly, setShowMistakesOnly] = useState<boolean>(false);

  React.useEffect(() => {
    if (result.overallScore >= 75) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [result]);

  const skillBars = [
    { label: 'การประเมินสถานการณ์', score: result.skillScores.assessment, color: 'bg-emerald-500' },
    { label: 'ลำดับการตัดสินใจ', score: result.skillScores.sequence, color: 'bg-teal-500' },
    { label: 'จังหวะการกดหน้าอก (Rhythm)', score: result.skillScores.cprRhythm, color: 'bg-emerald-400' },
    { label: 'การแจ้งเหตุ 1669', score: result.skillScores.call1669, color: 'bg-teal-400' },
    { label: 'การใช้ AED', score: result.skillScores.aed, color: 'bg-amber-400' },
    { label: 'เวลาในการตอบสนอง', score: result.skillScores.responseTime, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Result Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-5 rounded-3xl border border-emerald-700/50 shadow-2xl text-center space-y-3 relative overflow-hidden">
        <div className="absolute top-3 right-3">
          <Award className="w-12 h-12 text-emerald-400/20" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
          AFTER ACTION REVIEW (AAR)
        </span>

        <h2 className="text-xl font-extrabold text-white">
          สรุปการปฏิบัติภารกิจ: {result.scenarioTitle}
        </h2>

        {/* Overall Score Badge */}
        <div className="py-2">
          <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full bg-slate-950/80 border-4 border-emerald-400 shadow-inner">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {result.overallScore}%
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">คะแนนรวม</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 text-xs text-emerald-200/90">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            เวลา: {Math.floor(result.totalTimeSeconds / 60)}:{String(result.totalTimeSeconds % 60).padStart(2, '0')} นาที
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            BPM เฉลี่ย: {result.cprAverageBpm}
          </span>
        </div>
      </div>

      {/* Mandatory Certification Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-200 leading-snug">
          <strong className="font-semibold text-amber-400">ข้อความสำคัญ: </strong>
          &ldquo;คะแนนนี้เป็นผลจากสถานการณ์จำลอง ไม่ใช่การรับรองความสามารถในการทำ CPR&rdquo;
        </p>
      </div>

      {/* Skill Categories Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          สมรรถนะการปฏิบัติรายหมวด (Skill Categories)
        </h3>

        <div className="space-y-2.5">
          {skillBars.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">{item.label}</span>
                <span className="font-mono text-emerald-300 font-bold">{item.score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`${item.color} h-full transition-all duration-500 rounded-full`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-teal-400" />
          ลำดับเหตุการณ์การปฏิบัติ (Mission Timeline)
        </h3>

        <div className="space-y-2 border-l-2 border-slate-800 pl-3 ml-1">
          {result.timeline.map((entry, idx) => (
            <div key={idx} className="relative flex items-start gap-2.5 text-xs">
              <div
                className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                  entry.isSuccess ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span className="font-mono text-[11px] text-slate-400 shrink-0">{entry.timestamp}</span>
              <div className="space-y-0.5">
                <span className={`font-medium ${entry.isSuccess ? 'text-slate-200' : 'text-rose-300'}`}>
                  {entry.title}
                </span>
                {entry.note && <div className="text-[10px] text-slate-400">{entry.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mistakes Review Section */}
      {result.mistakes.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <button
            onClick={() => setShowMistakesOnly(prev => !prev)}
            className="w-full flex items-center justify-between text-xs font-bold text-rose-300"
          >
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              จุดที่ควรปรับปรุง/ข้อผิดพลาด ({result.mistakes.length})
            </span>
            {showMistakesOnly ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showMistakesOnly && (
            <div className="space-y-2 pt-1">
              {result.mistakes.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">{m}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="space-y-2 pt-2">
        <div className="flex gap-2">
          <button
            onClick={onRetryMission}
            className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ลองอีกครั้ง</span>
          </button>

          {result.mistakes.length > 0 && (
            <button
              onClick={() => setShowMistakesOnly(true)}
              className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>ทบทวนจุดที่ผิด</span>
            </button>
          )}
        </div>

        <button
          onClick={onGoHome}
          className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Home className="w-4 h-4 text-teal-400" />
          <span>กลับหน้าหลัก</span>
        </button>
      </div>
    </div>
  );
};
