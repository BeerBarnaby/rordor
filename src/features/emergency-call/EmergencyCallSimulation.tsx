"use client";
import { useState } from "react";
import { ArrowRight, CircleCheck, CircleX } from "lucide-react";
import { EMERGENCY_CALL_FIELDS } from "@/data/scenarios";
import { AnswerOption, FeedbackPanel } from "@/components/TrainingUI";
export function EmergencyCallSimulation({
  onCompleteStep,
}: {
  onCompleteStep: (score: number, mistakes: string[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { optionId: string; isCorrect: boolean; feedback: string }>
  >({});
  const [finished, setFinished] = useState(false);
  const field = EMERGENCY_CALL_FIELDS[index];
  const answer = answers[field.id];
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const score = Math.round((correctCount / EMERGENCY_CALL_FIELDS.length) * 100);
  const mistakes = EMERGENCY_CALL_FIELDS.filter(
    (f) => answers[f.id] && !answers[f.id].isCorrect,
  ).map((f) => `การแจ้ง${f.label}: ${answers[f.id].feedback}`);
  return (
    <div className="page-stack">
      <header>
        <h1 className="page-title">แจ้งเหตุ 1669</h1>
        <p className="caption mt-2">
          โหมดฝึกจำลอง · ไม่ได้เชื่อมต่อสายด่วนจริง
        </p>
      </header>
      {!finished ? (
        <>
          <div className="conversation-prompt">
            <p className="caption">
              เจ้าหน้าที่ · ข้อมูลรายการที่ {index + 1} จาก{" "}
              {EMERGENCY_CALL_FIELDS.length}
            </p>
            <blockquote>
              {field.question
                .replace(/^เจ้าหน้าที่ 1669: /, "")
                .replaceAll('"', "")}
            </blockquote>
          </div>
          <section>
            <h2 className="section-title">คุณจะตอบว่าอย่างไร?</h2>
            <div className="space-y-3">
              {field.options.map((option) => (
                <AnswerOption
                  key={option.id}
                  disabled={!!answer}
                  state={
                    answer?.optionId === option.id
                      ? answer.isCorrect
                        ? "correct"
                        : "incorrect"
                      : "default"
                  }
                  onClick={() =>
                    setAnswers((previous) => ({
                      ...previous,
                      [field.id]: {
                        optionId: option.id,
                        isCorrect: option.isCorrect,
                        feedback: option.feedback,
                      },
                    }))
                  }
                >
                  {option.text}
                </AnswerOption>
              ))}
            </div>
          </section>
          {answer && (
            <div>
              <FeedbackPanel correct={answer.isCorrect}>
                {answer.feedback}
              </FeedbackPanel>
              <button
                className="primary-button"
                onClick={() => {
                  if (index < EMERGENCY_CALL_FIELDS.length - 1)
                    setIndex(index + 1);
                  else setFinished(true);
                }}
              >
                {index === EMERGENCY_CALL_FIELDS.length - 1
                  ? "ดูสรุปการแจ้งเหตุ"
                  : "ดำเนินการต่อ"}
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <section>
            <h2 className="section-title">
              แจ้งข้อมูลครบ {correctCount} / {EMERGENCY_CALL_FIELDS.length}{" "}
              รายการ
            </h2>
            <details className="reference-details">
              <summary>ดูรายการที่แจ้งครบและจุดที่ควรทบทวน</summary>
              <ul>
                {EMERGENCY_CALL_FIELDS.map((f) => (
                  <li key={f.id} className="resource-row">
                    {answers[f.id]?.isCorrect ? (
                      <CircleCheck className="text-[var(--color-primary)]" />
                    ) : (
                      <CircleX className="text-[var(--color-error)]" />
                    )}
                    <span>{f.label}</span>
                    <span className="caption !flex-none">
                      {answers[f.id]?.isCorrect ? "ครบถ้วน" : "ควรทบทวน"}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </section>
          <button
            className="primary-button self-start"
            onClick={() => onCompleteStep(score, mistakes)}
          >
            ไปฝึกจังหวะ CPR
            <ArrowRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
