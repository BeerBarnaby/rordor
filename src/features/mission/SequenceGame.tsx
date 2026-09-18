"use client";

import React, { useState, useCallback } from "react";
import { INITIAL_SEQUENCE_CARDS } from "@/data/scenarios";
import { SequenceCardItem } from "@/types";
import {
  CircleCheck,
  CircleX,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
} from "lucide-react";

interface SequenceGameProps {
  onCompleteStep: (score: number, mistakes: string[]) => void;
}

export const SequenceGame: React.FC<SequenceGameProps> = ({
  onCompleteStep,
}) => {
  const [availableCards, setAvailableCards] = useState<SequenceCardItem[]>(() =>
    [...INITIAL_SEQUENCE_CARDS].sort(() => Math.random() - 0.5),
  );
  const [selectedCards, setSelectedCards] = useState<SequenceCardItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [feedbackList, setFeedbackList] = useState<
    { isCorrect: boolean; text: string }[]
  >([]);
  const [score, setScore] = useState<number>(0);

  const moveCard = (index: number, direction: -1 | 1) => {
    setSelectedCards((previous) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= previous.length) return previous;
      const next = [...previous];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const resetGame = useCallback(() => {
    const shuffled = [...INITIAL_SEQUENCE_CARDS].sort(
      () => Math.random() - 0.5,
    );
    setAvailableCards(shuffled);
    setSelectedCards([]);
    setIsSubmitted(false);
    setFeedbackList([]);
    setScore(0);
  }, []);

  const handleSelectCard = (card: SequenceCardItem) => {
    if (isSubmitted) return;
    setAvailableCards((prev) => prev.filter((c) => c.id !== card.id));
    setSelectedCards((prev) => [...prev, card]);
  };

  const handleDeselectCard = (card: SequenceCardItem) => {
    if (isSubmitted) return;
    setSelectedCards((prev) => prev.filter((c) => c.id !== card.id));
    setAvailableCards((prev) => [...prev, card]);
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
          text:
            card.feedbackIfWrong || `เลือกขั้นตอนที่ไม่ถูกต้อง: ${card.title}`,
        });
        mistakes.push(`เลือกข้อห้าม: ${card.title}`);
      } else if (card.correctOrder === expectedOrder) {
        correctCount++;
        feedbacks.push({
          isCorrect: true,
          text:
            card.feedbackIfCorrect ||
            `ลำดับที่ ${expectedOrder}: ${card.title} (ถูกต้อง)`,
        });
      } else {
        feedbacks.push({
          isCorrect: false,
          text: `ลำดับที่ ${expectedOrder} ควรทบทวน: ${card.feedbackIfWrong}`,
        });
        mistakes.push(`ลำดับผิดสำหรับ: ${card.title}`);
      }
    });

    INITIAL_SEQUENCE_CARDS.filter(
      (card) =>
        card.isCorrect &&
        !selectedCards.some((selected) => selected.id === card.id),
    ).forEach((card) => {
      feedbacks.push({
        isCorrect: false,
        text: `ยังไม่ได้เลือก: ${card.title}`,
      });
    });
    const totalValidSteps = INITIAL_SEQUENCE_CARDS.filter(
      (c) => c.isCorrect,
    ).length;
    const calculatedScore = Math.round((correctCount / totalValidSteps) * 100);

    setScore(calculatedScore);
    setFeedbackList(feedbacks);
    setIsSubmitted(true);
  };

  const handleProceed = () => {
    const mistakes = feedbackList
      .filter((f) => !f.isCorrect)
      .map((f) => f.text);
    onCompleteStep(score, mistakes);
  };

  return (
    <div className="page-stack">
      <header>
        <h1 className="page-title">ลำดับการช่วยเหลือ</h1>
        <p className="mt-2">เพื่อนล้มลงและไม่ตอบสนอง คุณจะทำอะไรตามลำดับ?</p>
        <p className="caption mt-2">
          เลือก 7 ขั้นตอนที่ควรทำ ใช้ลูกศรสลับลำดับก่อนตรวจคำตอบ
        </p>
      </header>
      <div className="sequence-grid">
        <section>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="section-title !mb-0">
              ลำดับของคุณ ({selectedCards.length}/7)
            </h2>
            {selectedCards.length > 0 && !isSubmitted && (
              <button className="text-button" onClick={resetGame}>
                ล้าง
              </button>
            )}
          </div>
          {selectedCards.length === 0 ? (
            <p className="caption py-6 border-y border-[var(--color-border)]">
              ยังไม่ได้เลือกขั้นตอน เลือกจากตัวเลือกการปฏิบัติ
            </p>
          ) : (
            <ol className="sequence-list">
              {selectedCards.map((card, index) => (
                <li key={card.id} className="sequence-item">
                  <div className="sequence-item-header">
                    <span className="caption pt-1">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="font-semibold">{card.title}</p>
                      <p className="caption mt-1">{card.subtitle}</p>
                    </div>
                    {isSubmitted &&
                      (card.isCorrect && card.correctOrder === index + 1 ? (
                        <CircleCheck
                          aria-label="ถูกต้อง"
                          size={20}
                          className="shrink-0 text-[var(--color-primary)]"
                        />
                      ) : (
                        <CircleX
                          aria-label="ควรทบทวน"
                          size={20}
                          className="shrink-0 text-[var(--color-error)]"
                        />
                      ))}
                  </div>
                  {!isSubmitted && (
                    <div className="sequence-controls">
                      <button
                        className="icon-button"
                        aria-label={`เลื่อน ${card.title} ขึ้น`}
                        disabled={index === 0}
                        onClick={() => moveCard(index, -1)}
                      >
                        <ChevronUp size={20} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`เลื่อน ${card.title} ลง`}
                        disabled={index === selectedCards.length - 1}
                        onClick={() => moveCard(index, 1)}
                      >
                        <ChevronDown size={20} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`นำ ${card.title} ออกจากลำดับ`}
                        onClick={() => handleDeselectCard(card)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
        {!isSubmitted && (
          <section>
            <h2 className="section-title">ตัวเลือกการปฏิบัติ</h2>
            <div className="sequence-list">
              {availableCards.map((card) => (
                <button
                  key={card.id}
                  className="answer-option"
                  onClick={() => handleSelectCard(card)}
                >
                  <span>
                    <span className="block font-semibold">{card.title}</span>
                    <span className="caption block mt-1">{card.subtitle}</span>
                  </span>
                  <Plus size={20} className="shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
      {!isSubmitted ? (
        <button
          className="primary-button self-start"
          disabled={selectedCards.length === 0}
          onClick={handleSubmit}
        >
          ตรวจคำตอบ
          <ArrowRight size={20} />
        </button>
      ) : (
        <section className="section-rule">
          <div role="status" aria-live="polite">
            <h2 className="section-title">ผลการเรียงลำดับ · {score}%</h2>
            <p className="caption">
              อ่านคำแนะนำ แล้วลองใหม่หรือไปฝึกการแจ้งเหตุ
            </p>
          </div>
          <ul className="mt-4 space-y-4">
            {feedbackList.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                {item.isCorrect ? (
                  <CircleCheck
                    size={20}
                    className="shrink-0 mt-1 text-[var(--color-primary)]"
                  />
                ) : (
                  <CircleX
                    size={20}
                    className="shrink-0 mt-1 text-[var(--color-error)]"
                  />
                )}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <div className="actions mt-6">
            <button className="secondary-button" onClick={resetGame}>
              <RotateCcw size={20} />
              ลองอีกครั้ง
            </button>
            <button className="primary-button" onClick={handleProceed}>
              ไปแจ้งเหตุ 1669
              <ArrowRight size={20} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
