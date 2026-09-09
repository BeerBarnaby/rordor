'use client';

import React, { useState } from 'react';
import { EMERGENCY_CALL_FIELDS } from '@/data/scenarios';
import { PhoneCall, ShieldAlert, CheckCircle2, XCircle, ArrowRight, UserCheck, Mic, Volume2 } from 'lucide-react';

interface EmergencyCallSimulationProps {
  onCompleteStep: (score: number, mistakes: string[]) => void;
}

export const EmergencyCallSimulation: React.FC<EmergencyCallSimulationProps> = ({ onCompleteStep }) => {
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, { optionId: string; isCorrect: boolean; feedback: string }>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentField = EMERGENCY_CALL_FIELDS[currentFieldIndex];

  const handleSelectOption = (optionId: string, isCorrect: boolean, feedback: string) => {
    const fieldId = currentField.id;
    const updated = {
      ...userAnswers,
      [fieldId]: { optionId, isCorrect, feedback },
    };
    setUserAnswers(updated);

    if (currentFieldIndex < EMERGENCY_CALL_FIELDS.length - 1) {
      setCurrentFieldIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    const mistakes: string[] = [];

    EMERGENCY_CALL_FIELDS.forEach((field) => {
      const ans = userAnswers[field.id];
      if (ans && ans.isCorrect) {
        correctCount++;
      } else {
        mistakes.push(`การแจ้ง${field.label}: ${ans?.feedback || 'ยังไม่ได้ระบุข้อมูล'}`);
      }
    });

    const score = Math.round((correctCount / EMERGENCY_CALL_FIELDS.length) * 100);
    return { score, mistakes };
  };

  const handleProceed = () => {
    const { score, mistakes } = calculateResults();
    onCompleteStep(score, mistakes);
  };

  const { score, mistakes } = calculateResults();

  return (
    <div className="space-y-5">
      {/* Prominent Safety Banner */}
      <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-center justify-between text-red-800">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <div className="text-xs font-bold text-red-700">
              สถานการณ์จำลองเพื่อการศึกษาเท่านั้น
            </div>
            <div className="text-xs text-red-600">
              ระบบนี้ไม่กดโทรออกสายจริงไปยัง 1669
            </div>
          </div>
        </div>
        <span className="text-[11px] bg-red-100 border border-red-200 px-2 py-0.5 rounded font-semibold text-red-600">
          SIMULATION
        </span>
      </div>

      {/* Simulated Call Screen Header */}
      <div className="bg-white border border-[#D8E4DE] rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D8E4DE] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#DFF4EC] text-[#0F5C4D] flex items-center justify-center">
              <PhoneCall className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17221E]">ศูนย์รับแจ้งเหตุฉุกเฉิน 1669</h3>
              <p className="text-xs text-[#0F5C4D] flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#0F5C4D] inline-block animate-pulse" />
                สายสดจำลอง (Connecting...)
              </p>
            </div>
          </div>
          <span className="text-xs text-[#5C6B65]">
            {currentFieldIndex + 1} / {EMERGENCY_CALL_FIELDS.length}
          </span>
        </div>

        {/* Call Progress */}
        <div className="w-full bg-[#DFF4EC] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0F5C4D] h-full transition-all duration-300 rounded-full"
            style={{
              width: `${((isFinished ? EMERGENCY_CALL_FIELDS.length : currentFieldIndex) / EMERGENCY_CALL_FIELDS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {!isFinished && currentField && (
        <div className="space-y-4">
          {/* Dispatcher Voice Bubble */}
          <div className="bg-white border border-[#D8E4DE] rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F5C4D]">
              <Volume2 className="w-4 h-4" />
              เจ้าหน้าที่ศูนย์รับแจ้งเหตุ 1669:
            </div>
            <p className="text-sm font-medium text-[#17221E] bg-[#F7FAF8] p-3.5 rounded-xl border border-[#D8E4DE] leading-relaxed">
              &ldquo;{currentField.question}&rdquo;
            </p>
          </div>

          {/* Options Selection */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-[#17221E] flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-[#0F5C4D]" />
              เลือกข้อความแจ้งเจ้าหน้าที่:
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {currentField.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id, opt.isCorrect, opt.feedback)}
                  className="p-3.5 rounded-xl bg-white border border-[#D8E4DE] hover:border-[#0F5C4D]/40 text-left transition-all active:scale-[0.99] space-y-1 group shadow-sm"
                >
                  <div className="text-sm font-medium text-[#17221E] group-hover:text-[#0F5C4D] transition-colors leading-relaxed">
                    {opt.text}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completed Checklist Summary */}
      {isFinished && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-white border border-[#D8E4DE] rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D8E4DE] pb-2">
              <h4 className="text-xs font-bold text-[#17221E] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#0F5C4D]" />
                สรุปความครบถ้วนการสื่อสาร 1669
              </h4>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg ${
                score >= 80 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                คะแนน {score}%
              </span>
            </div>

            <div className="space-y-2">
              {EMERGENCY_CALL_FIELDS.map((field) => {
                const ans = userAnswers[field.id];
                const isOk = ans && ans.isCorrect;
                return (
                  <div
                    key={field.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isOk
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <span className="font-medium">{field.label}</span>
                    <div className="flex items-center gap-1.5">
                      {isOk ? (
                        <>
                          <span className="text-xs text-green-600">ครบถ้วน</span>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-red-500">ขาดข้อมูลสำคัญ</span>
                          <XCircle className="w-4 h-4 text-red-500" />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {mistakes.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                <div className="font-bold text-amber-700">ข้อแนะนำการแจ้งเหตุครั้งถัดไป:</div>
                {mistakes.map((m, idx) => (
                  <div key={idx} className="text-xs leading-relaxed">
                    • {m}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleProceed}
            className="w-full py-3.5 rounded-xl bg-[#0F5C4D] hover:bg-[#0a4a3d] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>ไปขั้นตอนปั๊มหัวใจ (CPR Rhythm)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
