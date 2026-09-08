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
      <div className="bg-rose-950/80 border-2 border-rose-500/80 p-3 rounded-2xl flex items-center justify-between text-rose-200 shadow-lg animate-pulse">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-rose-300">
              สถานการณ์จำลองเพื่อการศึกษาเท่านั้น
            </div>
            <div className="text-[11px] text-rose-200">
              ระบบนี้ไม่กดโทรออกสายจริงไปยัง 1669
            </div>
          </div>
        </div>
        <span className="text-[10px] bg-rose-900 border border-rose-600 px-2 py-0.5 rounded font-mono font-bold">
          SIMULATION
        </span>
      </div>

      {/* Simulated Call Screen Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ศูนย์รับแจ้งเหตุฉุกเฉิน 1669</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                สายสดจำลอง (Connecting...)
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {currentFieldIndex + 1} / {EMERGENCY_CALL_FIELDS.length}
          </span>
        </div>

        {/* Call Progress */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{
              width: `${((isFinished ? EMERGENCY_CALL_FIELDS.length : currentFieldIndex) / EMERGENCY_CALL_FIELDS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {!isFinished && currentField && (
        <div className="space-y-4">
          {/* Dispatcher Voice Bubble */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 relative">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Volume2 className="w-4 h-4 text-emerald-300" />
              เจ้าหน้าที่ศูนย์รับแจ้งเหตุ 1669:
            </div>
            <p className="text-sm font-medium text-white bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
              &ldquo;{currentField.question}&rdquo;
            </p>
          </div>

          {/* Options Selection */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-teal-400" />
              เลือกข้อความแจ้งเจ้าหน้าที่:
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {currentField.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id, opt.isCorrect, opt.feedback)}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 text-left transition-all active:scale-[0.99] space-y-1 group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors leading-relaxed">
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                สรุปความครบถ้วนการสื่อสาร 1669
              </h4>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
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
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isOk
                        ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-800/40 text-rose-200'
                    }`}
                  >
                    <span className="font-medium">{field.label}</span>
                    <div className="flex items-center gap-1.5">
                      {isOk ? (
                        <>
                          <span className="text-[11px] text-emerald-400">ครบถ้วน</span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </>
                      ) : (
                        <>
                          <span className="text-[11px] text-rose-400">ขาดข้อมูลสำคัญ</span>
                          <XCircle className="w-4 h-4 text-rose-400" />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {mistakes.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <div className="font-bold text-amber-400">ข้อแนะนำการแจ้งเหตุครั้งถัดไป:</div>
                {mistakes.map((m, idx) => (
                  <div key={idx} className="text-[11px] leading-relaxed">
                    • {m}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleProceed}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
          >
            <span>ไปขั้นตอนปั๊มหัวใจ (CPR Rhythm)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
