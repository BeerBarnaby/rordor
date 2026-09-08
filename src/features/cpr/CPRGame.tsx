'use client';

import React, { useState, useRef } from 'react';
import { RhythmCalculator } from '@/lib/rhythmCalculator';
import { RhythmCalculationResult } from '@/types';
import { Heart, Activity, AlertCircle, ArrowRight, Wind, ShieldCheck } from 'lucide-react';

interface CPRGameProps {
  targetCompressions?: number;
  onCompleteStep: (rhythmScore: number, averageBpm: number) => void;
}

export const CPRGame: React.FC<CPRGameProps> = ({
  targetCompressions = 30,
  onCompleteStep,
}) => {
  const [compressions, setCompressions] = useState<number>(0);
  const [inTargetCount, setInTargetCount] = useState<number>(0);
  const [bpmHistory, setBpmHistory] = useState<number[]>([]);
  const [calculatorResult, setCalculatorResult] = useState<RhythmCalculationResult>({
    bpm: 0,
    state: 'insufficient',
    feedbackMessage: 'เริ่มกดจังหวะปั๊มหัวใจ (เป้าหมาย 100-120 ครั้ง/นาที)',
    colorClass: 'text-slate-400 border-slate-700 bg-slate-900',
    tapCount: 0,
  });

  // Rescue breath 30:2 transition states
  const [mode, setMode] = useState<'compressing' | 'rescuing' | 'finished'>('compressing');
  const [rescueStep, setRescueStep] = useState<number>(0);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  const rhythmCalcRef = useRef<RhythmCalculator>(new RhythmCalculator(6));

  const handleTap = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (mode !== 'compressing') return;

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(45);
      } catch {}
    }

    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 120);

    const now = Date.now();
    const result = rhythmCalcRef.current.addTap(now);
    setCalculatorResult(result);

    const nextCount = compressions + 1;
    setCompressions(nextCount);

    if (result.state === 'good') {
      setInTargetCount(prev => prev + 1);
    }

    if (result.bpm > 0) {
      setBpmHistory(prev => [...prev, result.bpm]);
    }

    if (nextCount >= targetCompressions) {
      setMode('rescuing');
      setRescueStep(0);
    }
  };

  const handleRescueStepClick = () => {
    if (rescueStep === 0) {
      setRescueStep(1);
    } else if (rescueStep === 1) {
      setRescueStep(2);
    } else {
      setMode('finished');
    }
  };

  const calculateFinalStats = () => {
    const finalScore = RhythmCalculator.calculateOverallRhythmScore(inTargetCount, targetCompressions);
    const avgBpm = bpmHistory.length > 0 
      ? Math.round(bpmHistory.reduce((a, b) => a + b, 0) / bpmHistory.length) 
      : 0;
    return { finalScore, avgBpm };
  };

  const handleFinish = () => {
    const { finalScore, avgBpm } = calculateFinalStats();
    onCompleteStep(finalScore, avgBpm);
  };

  const { finalScore, avgBpm } = calculateFinalStats();

  return (
    <div className="space-y-5 select-none">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
            ภารกิจขั้นที่ 2/4
          </span>
          <span className="text-xs text-slate-400 font-mono">CPR Rhythm Training</span>
        </div>
        <h3 className="text-base font-bold text-white">ฝึกจังหวะปั๊มหัวใจ (CPR Compressions)</h3>
        <p className="text-xs text-slate-300">
          กดปุ่มตรงกลางตามจังหวะเป้าหมาย <strong className="text-emerald-400 font-semibold">100–120 ครั้ง/นาที</strong>
        </p>
      </div>

      {mode === 'compressing' && (
        <div className="space-y-5">
          {/* Realtime Stats Bar */}
          <div className="grid grid-cols-2 gap-3">
            {/* Compression Counter */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                จำนวนการกด
              </span>
              <div className="text-2xl font-black text-white mt-0.5 font-mono">
                {compressions} <span className="text-sm font-normal text-slate-500">/ {targetCompressions}</span>
              </div>
            </div>

            {/* Live Rhythm BPM */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                จังหวะปัจจุบัน
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5 font-mono">
                {calculatorResult.bpm > 0 ? calculatorResult.bpm : '--'}{' '}
                <span className="text-xs font-normal text-slate-400">ครั้ง/นาที</span>
              </div>
            </div>
          </div>

          {/* Feedback Status Pill */}
          <div
            className={`p-3 rounded-xl border text-center text-xs font-bold transition-all duration-200 ${calculatorResult.colorClass}`}
          >
            {calculatorResult.feedbackMessage}
          </div>

          {/* Main Interactive Compression Tap Button */}
          <div className="py-4 flex flex-col items-center justify-center">
            <button
              onMouseDown={handleTap}
              onTouchStart={handleTap}
              className={`relative w-48 h-48 rounded-full bg-gradient-to-b from-emerald-500 to-teal-700 border-4 border-emerald-300 shadow-2xl flex flex-col items-center justify-center text-white transition-transform duration-75 active:scale-95 touch-none ${
                isPulsing ? 'scale-95 shadow-emerald-400/50' : 'scale-100 shadow-emerald-950/80'
              }`}
            >
              <div className="absolute inset-0 rounded-full border-2 border-emerald-300/40 animate-ping pointer-events-none" />
              <Heart className={`w-16 h-16 text-white drop-shadow-md transition-transform ${isPulsing ? 'scale-125' : 'scale-100'}`} />
              <span className="mt-2 text-sm font-black tracking-wider uppercase">กดปั๊มหัวใจ</span>
              <span className="text-[10px] text-emerald-100 opacity-90 font-mono">PUSH HERE</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>ดัชนีวัดผล: Compression Rhythm Score</span>
            </div>
            <p className="leading-relaxed">
              คะแนนนี้วัดเฉพาะจังหวะความเร็วของเวลาในการกด ไม่ใช่การรับรองความแม่นยำในการทำ CPR (เนื่องจากโทรศัพท์มือถือไม่สามารถวัดความลึกในการกด การคืนตัวของหน้าอก หรือแรงกดจริงได้)
            </p>
          </div>
        </div>
      )}

      {/* 30:2 Rescue Breath Simulation Sequence */}
      {mode === 'rescuing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
              <Wind className="w-4 h-4" />
              ขั้นตอนสลับการช่วยหายใจ (30:2 Rescue Breath)
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              ครบ 30 Compressions
            </span>
          </div>

          <div className="space-y-3">
            {rescueStep === 0 && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/50 space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Wind className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">ขั้นตอนที่ 1: เปิดทางเดินหายใจ (Airway)</h4>
                <p className="text-xs text-slate-300">
                  เชิดคางและกดหน้าผากผู้ป่วยลง เพื่อเปิดทางเดินหายใจให้โล่ง
                </p>
              </div>
            )}

            {rescueStep === 1 && (
              <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-700/50 space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
                  <Wind className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-white">ขั้นตอนที่ 2: เป่าปาก ครั้งที่ 1 (Breath 1)</h4>
                <p className="text-xs text-slate-300">
                  บีบจมูก เป่าลมเข้าปากผู้ป่วย 1 วินาที สังเกตหน้าอกยกขึ้น
                </p>
              </div>
            )}

            {rescueStep === 2 && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/50 space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Wind className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-white">ขั้นตอนที่ 3: เป่าปาก ครั้งที่ 2 (Breath 2)</h4>
                <p className="text-xs text-slate-300">
                  ปล่อยให้ลมออก แล้วเป่าซ้ำอีก 1 ครั้ง ก่อนเตรียมกลับเข้าสู่การกดหน้าอกหรือใช้ AED
                </p>
              </div>
            )}

            <button
              onClick={handleRescueStepClick}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{rescueStep === 2 ? 'เสร็จสิ้นการช่วยหายใจ 30:2' : 'ถัดไป'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Finished Summary */}
      {mode === 'finished' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              สรุปผล Compression Rhythm Score
            </h4>
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {finalScore}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <div className="text-[10px] text-slate-400">คะแนนจังหวะ (Rhythm Score)</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{finalScore}%</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <div className="text-[10px] text-slate-400">ความเร็วเฉลี่ย (Avg BPM)</div>
              <div className="text-xl font-bold text-teal-300 font-mono mt-0.5">{avgBpm} BPM</div>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
          >
            <span>AED มาถึงแล้ว! ไปขั้นตอน AED Simulation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
