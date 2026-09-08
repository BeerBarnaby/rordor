'use client';

import React, { useState, useCallback } from 'react';
import { INITIAL_SEQUENCE_CARDS } from '@/data/scenarios';
import { SequenceCardItem } from '@/types';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, ShieldCheck, Info, Sparkles } from 'lucide-react';

interface SequenceGameProps {
  onCompleteStep: (score: number, mistakes: string[]) => void;
}

export const SequenceGame: React.FC<SequenceGameProps> = ({ onCompleteStep }) => {
  const [availableCards, setAvailableCards] = useState<SequenceCardItem[]>(() =>
    [...INITIAL_SEQUENCE_CARDS].sort(() => Math.random() - 0.5)
  );
  const [selectedCards, setSelectedCards] = useState<SequenceCardItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [feedbackList, setFeedbackList] = useState<{ isCorrect: boolean; text: string }[]>([]);
  const [score, setScore] = useState<number>(0);

  const resetGame = useCallback(() => {
    const shuffled = [...INITIAL_SEQUENCE_CARDS].sort(() => Math.random() - 0.5);
    setAvailableCards(shuffled);
    setSelectedCards([]);
    setIsSubmitted(false);
    setFeedbackList([]);
    setScore(0);
  }, []);

  const handleSelectCard = (card: SequenceCardItem) => {
    if (isSubmitted) return;
    setAvailableCards(prev => prev.filter(c => c.id !== card.id));
    setSelectedCards(prev => [...prev, card]);
  };

  const handleDeselectCard = (card: SequenceCardItem) => {
    if (isSubmitted) return;
    setSelectedCards(prev => prev.filter(c => c.id !== card.id));
    setAvailableCards(prev => [...prev, card]);
  };

  const handleSubmit = () => {
    if (selectedCards.length === 0) return;

    let correctCount = 0;
    const feedbacks: { isCorrect: boolean; text: string }[] = [];
    const mistakes: string[] = [];

    selectedCards.forEach((card, index) => {
      const expectedOrder = index + 1;

      if (!card.isCorrect) {
        feedbacks.push({
          isCorrect: false,
          text: card.feedbackIfWrong || `เลือกขั้นตอนที่ไม่ถูกต้อง: ${card.title}`,
        });
        mistakes.push(`เลือกข้อห้าม: ${card.title}`);
      } else if (card.correctOrder === expectedOrder) {
        correctCount++;
        feedbacks.push({
          isCorrect: true,
          text: card.feedbackIfCorrect || `ลำดับที่ ${expectedOrder}: ${card.title} (ถูกต้อง)`,
        });
      } else {
        feedbacks.push({
          isCorrect: false,
          text: `ลำดับที่ ${expectedOrder} ควรรวน: ${card.feedbackIfWrong}`,
        });
        mistakes.push(`ลำดับผิดสำหรับ: ${card.title}`);
      }
    });

    const totalValidSteps = INITIAL_SEQUENCE_CARDS.filter(c => c.isCorrect).length;
    const calculatedScore = Math.round((correctCount / totalValidSteps) * 100);

    setScore(calculatedScore);
    setFeedbackList(feedbacks);
    setIsSubmitted(true);
  };

  const handleProceed = () => {
    const mistakes = feedbackList.filter(f => !f.isCorrect).map(f => f.text);
    onCompleteStep(score, mistakes);
  };

  return (
    <div className="space-y-5">
      {/* Title Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1.5 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
            ภารกิจขั้นที่ 1/4
          </span>
          <span className="text-xs text-slate-400 font-mono">Sequence Assessment</span>
        </div>
        <h3 className="text-base font-bold text-white leading-snug">
          จัดลำดับขั้นตอนการเข้าช่วยเหลือผู้ป่วย
        </h3>
        <p className="text-xs text-slate-300">
          แตะเลือกการปฏิบัติให้ถูกต้องตามลำดับขั้นตอนสากล (ระวังข้อห้ามและตัวลวง)
        </p>
      </div>

      {/* Selected Sequence Slots */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-3 min-h-[220px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            ลำดับการปฏิบัติที่เลือก ({selectedCards.length})
          </span>
          {selectedCards.length > 0 && !isSubmitted && (
            <button
              onClick={() => {
                setAvailableCards(INITIAL_SEQUENCE_CARDS.sort(() => Math.random() - 0.5));
                setSelectedCards([]);
              }}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {selectedCards.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
            แตะตัวเลือกด้านล่างเพื่อเรียงลำดับขั้นตอน
          </div>
        ) : (
          <div className="space-y-2">
            {selectedCards.map((card, idx) => (
              <div
                key={card.id}
                onClick={() => handleDeselectCard(card)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSubmitted
                    ? card.isCorrect && card.correctOrder === idx + 1
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                    : 'bg-slate-800 border-slate-700 text-white hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold">{card.title}</div>
                    {card.subtitle && <div className="text-[10px] opacity-70">{card.subtitle}</div>}
                  </div>
                </div>

                {!isSubmitted && (
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    นำออก
                  </span>
                )}
                {isSubmitted && (
                  card.isCorrect && card.correctOrder === idx + 1 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Choices Pool */}
      {!isSubmitted && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">ตัวเลือกการปฏิบัติ (แตะเพื่อเลือก):</div>
          <div className="grid grid-cols-1 gap-2">
            {availableCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleSelectCard(card)}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 text-left transition-all active:scale-[0.99] flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">{card.title}</div>
                  {card.subtitle && <div className="text-[10px] text-slate-400">{card.subtitle}</div>}
                </div>
                <span className="text-xs text-emerald-400 font-bold">+ เลือก</span>
              </button>
            ))}
          </div>

          <div className="pt-3">
            <button
              onClick={handleSubmit}
              disabled={selectedCards.length === 0}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ส่งคำตอบประเมินลำดับ</span>
            </button>
          </div>
        </div>
      )}

      {/* Educational Feedback Section */}
      {isSubmitted && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-400" />
                คำแนะนำและข้อเรียนรู้ (Educational Feedback)
              </h4>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                คะแนน {score}%
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {feedbackList.map((item, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                    item.isCorrect
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-800/40 text-rose-200'
                  }`}
                >
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <p className="text-[11px] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetGame}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ลองอีกครั้ง
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-950"
            >
              <span>ไปขั้นตอนแจ้ง 1669</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
