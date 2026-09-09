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
      <div className="bg-white border border-[#D8E4DE] rounded-2xl p-4 space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#0F5C4D] bg-[#DFF4EC] px-2.5 py-0.5 rounded-lg border border-[#D8E4DE]">
            ภารกิจขั้นที่ 3/4
          </span>
          <span className="text-xs text-[#5C6B65]">AED Simulation</span>
        </div>
        <h3 className="text-base font-bold text-[#17221E] flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#F4A63D] fill-current" />
          การใช้เครื่องกระตุกหัวใจไฟฟ้าอัตโนมัติ (AED)
        </h3>
        <p className="text-xs text-[#5C6B65]">
          ปฏิบัติตามขั้นตอนจำลองระบบเครื่อง AED อย่างปลอดภัย
        </p>
      </div>

      {/* AED Device Frame */}
      <div className="bg-white border-2 border-[#F4A63D]/50 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
        {/* Device Status Bar */}
        <div className="flex items-center justify-between border-b border-[#D8E4DE] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0F5C4D] animate-pulse" />
            <span className="text-xs font-bold text-[#F4A63D] tracking-wide">
              AED TRAINER DEVICE (จำลอง)
            </span>
          </div>
          <span className="text-xs text-[#5C6B65]">
            ขั้นตอน {activeStepIndex + 1} / {AED_STEPS.length}
          </span>
        </div>

        {/* Dynamic Voice Prompt Display */}
        <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#D8E4DE] space-y-2 text-center">
          <div className="text-[11px] text-[#F4A63D] font-semibold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> เสียงคำแนะนำ AED
          </div>
          <div className="text-sm font-bold text-[#17221E] leading-relaxed">
            {isAnalyzing ? (
              <span className="text-[#F4A63D] animate-pulse">
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
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#D8E4DE] flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-200 animate-pulse">
                  <Power className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-[#17221E]">กดปุ่ม POWER เพื่อเปิดเครื่อง AED</div>
              </div>
            )}

            {activeStepIndex === 1 && (
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#D8E4DE] space-y-3 text-center">
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="p-3 rounded-xl bg-[#DFF4EC] border border-[#D8E4DE] text-[#0F5C4D]">
                    แผ่นที่ 1: ใต้ไหปลาร้าขวา
                  </div>
                  <div className="p-3 rounded-xl bg-[#DFF4EC] border border-[#D8E4DE] text-[#0F5C4D]">
                    แผ่นที่ 2: ใต้ราวนมซ้าย
                  </div>
                </div>
                <div className="text-xs text-[#5C6B65]">แปะแผ่นนำไฟฟ้าแนบสนิทกับผิวหนังแห้งของผู้ป่วย</div>
              </div>
            )}

            {activeStepIndex === 2 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <AlertTriangle className="w-10 h-10 text-[#F4A63D] mx-auto animate-bounce" />
                <div className="text-sm font-bold text-amber-800">
                  ตะโกน &ldquo;ถอย! ห้ามแตะตัวผู้ป่วย&rdquo;
                </div>
              </div>
            )}

            {activeStepIndex === 3 && (
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#D8E4DE] text-center space-y-3">
                <div className="text-sm font-bold text-red-700">
                  ตะโกน &ldquo;ฉันถอย คุณถอย ทุกคนถอย&rdquo; แล้วกดปุ่ม SHOCK
                </div>
                <div className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs flex flex-col items-center justify-center mx-auto shadow-lg border-4 border-red-300 cursor-pointer animate-pulse">
                  <Zap className="w-8 h-8 fill-current" />
                  <span>SHOCK</span>
                </div>
              </div>
            )}

            {activeStepIndex === 4 && (
              <div className="p-4 rounded-xl bg-[#DFF4EC] border border-[#D8E4DE] text-center space-y-2">
                <HeartPulse className="w-10 h-10 text-[#0F5C4D] mx-auto" />
                <div className="text-sm font-bold text-[#17221E]">
                  ทำการกดหน้าอก CPR ต่อเนื่องทันที!
                </div>
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              onClick={handleStepAction}
              disabled={isAnalyzing}
              className="w-full py-3.5 rounded-xl bg-[#F4A63D] hover:bg-[#e09530] disabled:opacity-40 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{isAnalyzing ? 'กำลังวิเคราะห์จังหวะ...' : 'ปฏิบัติตามขั้นตอน'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* All AED steps completed */}
        {activeStepIndex >= AED_STEPS.length - 1 && completedStepIds.length >= AED_STEPS.length && (
          <div className="pt-3 space-y-3 animate-in fade-in duration-300">
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span>ปฏิบัติตามลำดับการใช้ AED ครบถ้วนถูกต้อง!</span>
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-3.5 rounded-xl bg-[#0F5C4D] hover:bg-[#0a4a3d] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
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
