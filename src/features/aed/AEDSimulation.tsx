'use client';

import React, { useState } from 'react';
import { AED_STEPS } from '@/data/scenarios';
import { Zap, Power, AlertTriangle, HeartPulse, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface AEDSimulationProps {
  onCompleteStep: (score: number, mistakes: string[]) => void;
}

export const AEDSimulation: React.FC<AEDSimulationProps> = ({ onCompleteStep }) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const currentStep = AED_STEPS[activeStepIndex];

  const handleStepAction = () => {
    if (activeStepIndex === 2) {
      // Analyzing rhythm simulation delay
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setCompletedStepIds(prev => [...prev, currentStep.id]);
        setActiveStepIndex(prev => prev + 1);
      }, 2000);
      return;
    }

    setCompletedStepIds(prev => [...prev, currentStep.id]);

    if (activeStepIndex < AED_STEPS.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    }
  };

  const handleProceed = () => {
    onCompleteStep(100, []);
  };

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
            ภารกิจขั้นที่ 3/4
          </span>
          <span className="text-xs text-slate-400 font-mono">AED Sequence Simulation</span>
        </div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400 fill-current" />
          การใช้เครื่องกระตุกหัวใจไฟฟ้าอัตโนมัติ (AED)
        </h3>
        <p className="text-xs text-slate-300">
          ปฏิบัติตามขั้นตอนจำลองระบบเครื่อง AED อย่างปลอดภัย
        </p>
      </div>

      {/* AED Device Frame */}
      <div className="bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Device Status Bar */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black text-amber-300 tracking-wider">
              AED TRAINER DEVICE (จำลอง)
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            ขั้นตอน {activeStepIndex + 1} / {AED_STEPS.length}
          </span>
        </div>

        {/* Dynamic Voice Prompt Display */}
        <div className="p-4 rounded-2xl bg-black/80 border border-amber-500/30 space-y-2 text-center">
          <div className="text-[10px] text-amber-400 uppercase font-mono tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> Voice Guidance / เสียงคำแนะนำ AED
          </div>
          <div className="text-sm font-bold text-white leading-relaxed">
            {isAnalyzing ? (
              <span className="text-amber-400 animate-pulse">
                &ldquo;กำลังวิเคราะห์จังหวะหัวใจ... ห้ามสัมผัสตัวผู้ป่วย!&rdquo;
              </span>
            ) : (
              `"${currentStep ? currentStep.description : 'พร้อมเข้าสู่การ CPR ต่อเนื่อง'}"`
            )}
          </div>
        </div>

        {/* Step Action Visual Card */}
        {currentStep && (
          <div className="space-y-4">
            {activeStepIndex === 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 animate-pulse">
                  <Power className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-white">กดปุ่ม POWER เพื่อเปิดเครื่อง AED</div>
              </div>
            )}

            {activeStepIndex === 1 && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-center">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                  <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-700/50 text-teal-200">
                    แผ่นที่ 1: ใต้ไหปลาร้าขวา
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-700/50 text-teal-200">
                    แผ่นที่ 2: ใต้ราวนมซ้าย
                  </div>
                </div>
                <div className="text-xs text-slate-300">แปะแผ่นนำไฟฟ้าแนบสนิทกับผิวหนังแห้งของผู้ป่วย</div>
              </div>
            )}

            {activeStepIndex === 2 && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                <div className="text-xs font-bold text-amber-300">
                  ตะโกน &ldquo;ถอย! ห้ามแตะตัวผู้ป่วย&rdquo;
                </div>
              </div>
            )}

            {activeStepIndex === 3 && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
                <div className="text-xs font-bold text-rose-300">
                  ตะโกน &ldquo;ฉันถอย คุณถอย ทุกคนถอย&rdquo; แล้วกดปุ่ม SHOCK
                </div>
                <div className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex flex-col items-center justify-center mx-auto shadow-xl shadow-rose-950 border-4 border-rose-400 cursor-pointer animate-pulse">
                  <Zap className="w-8 h-8 fill-current" />
                  <span>SHOCK</span>
                </div>
              </div>
            )}

            {activeStepIndex === 4 && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/50 text-center space-y-2">
                <HeartPulse className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-white">
                  ทำการกดหน้าอก CPR ต่อเนื่องทันที!
                </div>
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              onClick={handleStepAction}
              disabled={isAnalyzing}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>{isAnalyzing ? 'กำลังวิเคราะห์จังหวะ...' : 'ปฏิบัติตามขั้นตอน'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* All AED steps completed */}
        {activeStepIndex >= AED_STEPS.length - 1 && completedStepIds.length >= AED_STEPS.length && (
          <div className="pt-3 space-y-3 animate-in fade-in duration-300">
            <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>ปฏิบัติตามลำดับการใช้ AED ครบถ้วนถูกต้อง!</span>
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
            >
              <span>สรุปภารกิจ (After Action Review)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
