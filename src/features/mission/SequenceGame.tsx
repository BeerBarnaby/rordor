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
      <div className="bg-white border border-[#D8E4DE] rounded-2xl p-4 space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#0F5C4D] bg-[#DFF4EC] px-2.5 py-0.5 rounded-lg border border-[#D8E4DE]">
            ภารกิจขั้นที่ 1/4
          </span>
          <span className="text-xs text-[#5C6B65]">ลำดับการช่วยเหลือ</span>
        </div>
        <h3 className="text-base font-bold text-[#17221E] leading-snug">
          จัดลำดับขั้นตอนการเข้าช่วยเหลือผู้ป่วย
        </h3>
        <p className="text-xs text-[#5C6B65]">
          แตะเลือกการปฏิบัติให้ถูกต้องตามลำดับขั้นตอนสากล (ระวังข้อห้ามและตัวลวง)
        </p>
      </div>

      {/* Selected Sequence Slots */}
      <div className="bg-[#F7FAF8] border border-[#D8E4DE] rounded-2xl p-4 space-y-3 min-h-[220px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F5C4D] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            ลำดับการปฏิบัติที่เลือก ({selectedCards.length})
          </span>
          {selectedCards.length > 0 && !isSubmitted && (
            <button
              onClick={() => {
                setAvailableCards(INITIAL_SEQUENCE_CARDS.sort(() => Math.random() - 0.5));
                setSelectedCards([]);
              }}
              className="text-xs text-[#5C6B65] hover:text-[#17221E] underline"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {selectedCards.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-[#D8E4DE] rounded-xl flex items-center justify-center text-xs text-[#5C6B65]">
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
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-red-50 border-red-300 text-red-800'
                    : 'bg-white border-[#D8E4DE] text-[#17221E] hover:border-[#0F5C4D]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#DFF4EC] text-[#0F5C4D] font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold">{card.title}</div>
                    {card.subtitle && <div className="text-[11px] opacity-70">{card.subtitle}</div>}
                  </div>
                </div>

                {!isSubmitted && (
                  <span className="text-[11px] text-[#5C6B65] bg-[#F7FAF8] px-2 py-0.5 rounded border border-[#D8E4DE]">
                    นำออก
                  </span>
                )}
                {isSubmitted && (
                  card.isCorrect && card.correctOrder === idx + 1 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
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
          <div className="text-xs font-semibold text-[#17221E]">ตัวเลือกการปฏิบัติ (แตะเพื่อเลือก):</div>
          <div className="grid grid-cols-1 gap-2">
            {availableCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleSelectCard(card)}
                className="p-3.5 rounded-xl bg-white border border-[#D8E4DE] hover:border-[#0F5C4D]/40 text-left transition-all active:scale-[0.99] flex items-center justify-between shadow-sm"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#17221E]">{card.title}</div>
                  {card.subtitle && <div className="text-[11px] text-[#5C6B65]">{card.subtitle}</div>}
                </div>
                <span className="text-xs text-[#0F5C4D] font-bold">+ เลือก</span>
              </button>
            ))}
          </div>

          <div className="pt-3">
            <button
              onClick={handleSubmit}
              disabled={selectedCards.length === 0}
              className="w-full py-3.5 rounded-xl bg-[#0F5C4D] hover:bg-[#0a4a3d] disabled:opacity-40 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
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
          <div className="p-4 rounded-2xl bg-white border border-[#D8E4DE] space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D8E4DE] pb-2">
              <h4 className="text-xs font-bold text-[#17221E] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#0F5C4D]" />
                คำแนะนำและข้อเรียนรู้
              </h4>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg ${
                score >= 80 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                คะแนน {score}%
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {feedbackList.map((item, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    item.isCorrect
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetGame}
              className="flex-1 py-3 rounded-xl bg-white border border-[#D8E4DE] hover:border-[#0F5C4D]/30 text-[#17221E] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ลองอีกครั้ง
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 py-3 rounded-xl bg-[#0F5C4D] hover:bg-[#0a4a3d] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
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
