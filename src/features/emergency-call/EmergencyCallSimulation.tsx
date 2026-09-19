"use client";
import { useState } from "react";
import { ArrowRight, CircleAlert, CircleCheck, CircleX, RotateCcw } from "lucide-react";
import { getEmergencyCallFields } from "@/data/scenarios";
import { AnswerOption, FeedbackPanel } from "@/components/TrainingUI";
import { ScenarioVariant } from "@/types";

type AnswerState = "correct" | "incomplete" | "incorrect";

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
  }
  return next;
}

export function EmergencyCallSimulation({
  onCompleteStep,
  scenario,
}: {
  onCompleteStep: (score: number, mistakes: string[]) => void;
  scenario: ScenarioVariant;
}) {
  const [fields] = useState(() =>
    getEmergencyCallFields(scenario).map((field) => ({
      ...field,
      options: shuffle(field.options),
    })),
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { optionId: string; state: AnswerState; feedback: string }>
  >({});
  const [firstAnswers, setFirstAnswers] = useState<
    Record<string, { state: AnswerState; feedback: string }>
  >({});
  const [finished, setFinished] = useState(false);
  const field = fields[index];
  const answer = answers[field.id];
  const correctCount = Object.values(firstAnswers).filter((a) => a.state === "correct").length;
  const score = Math.round(
    (Object.values(firstAnswers).reduce(
      (sum, item) => sum + (item.state === "correct" ? 1 : item.state === "incomplete" ? 0.5 : 0),
      0,
    ) /
      fields.length) *
      100,
  );
  const mistakes = fields
    .filter((item) => firstAnswers[item.id]?.state !== "correct")
    .map((item) => `การแจ้ง${item.label}: ${firstAnswers[item.id]?.feedback}`);

  function chooseAnswer(option: (typeof field.options)[number]) {
    const state: AnswerState = option.isCorrect
      ? "correct"
      : option.status ?? "incorrect";
    setAnswers((previous) => ({
      ...previous,
      [field.id]: { optionId: option.id, state, feedback: option.feedback },
    }));
    setFirstAnswers((previous) =>
      previous[field.id]
        ? previous
        : { ...previous, [field.id]: { state, feedback: option.feedback } },
    );
  }
  return (
    <div className="page-stack training-screen call-training">
      <header>
        <p className="protocol-code">ขั้น 02 · การสื่อสาร</p>
        <h1 className="page-title">แจ้งเหตุ 1669</h1>
        <p className="lead mt-3">ฟังคำถาม แล้วเลือกข้อมูลที่ช่วยให้เจ้าหน้าที่ประเมินเหตุได้เร็ว</p>
      </header>
      {!finished ? (
        <>
          <div className="conversation-prompt">
            <p className="operator-label">
              สายจำลอง 1669 · รายการที่ {index + 1} จาก{" "}
              {fields.length}
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
                      ? answer.state
                      : "default"
                  }
                  onClick={() => chooseAnswer(option)}
                >
                  {option.text}
                </AnswerOption>
              ))}
            </div>
          </section>
          {answer && (
            <div>
              <FeedbackPanel state={answer.state}>
                {answer.feedback}
              </FeedbackPanel>
              {answer.state === "correct" ? (
                <button
                  className="primary-button"
                  onClick={() => {
                    if (index < fields.length - 1) setIndex(index + 1);
                    else setFinished(true);
                  }}
                >
                  {index === fields.length - 1 ? "ดูสรุปการแจ้งเหตุ" : "รับสายต่อ"}
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  className="secondary-button"
                  onClick={() =>
                    setAnswers((previous) => {
                      const next = { ...previous };
                      delete next[field.id];
                      return next;
                    })
                  }
                >
                  <RotateCcw size={18} /> แก้คำตอบ
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <section>
            <h2 className="section-title">
              แจ้งครบตั้งแต่ครั้งแรก {correctCount} / {fields.length}{" "}
              รายการ
            </h2>
            <details className="reference-details">
              <summary>ดูรายการที่แจ้งครบและจุดที่ควรทบทวน</summary>
              <ul>
                {fields.map((f) => (
                  <li key={f.id} className="resource-row">
                    {firstAnswers[f.id]?.state === "correct" ? (
                      <CircleCheck className="text-[var(--color-success)]" />
                    ) : firstAnswers[f.id]?.state === "incomplete" ? (
                      <CircleAlert className="text-[var(--color-warning)]" />
                    ) : (
                      <CircleX className="text-[var(--color-error)]" />
                    )}
                    <span>{f.label}</span>
                    <span className="caption !flex-none">
                      {firstAnswers[f.id]?.state === "correct"
                        ? "ครบถ้วน"
                        : firstAnswers[f.id]?.state === "incomplete"
                          ? "ยังขาดข้อมูล"
                          : "ควรทบทวน"}
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
