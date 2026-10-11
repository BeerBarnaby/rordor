"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

type RatingKey = "contentRating" | "usabilityRating" | "confidenceRating" | "appRating";
type FeedbackDraft = Record<RatingKey, number> & { improvementArea: string; comment: string };
type SavedFeedback = {
  content_rating?: number;
  usability_rating?: number;
  confidence_rating?: number;
  app_rating?: number;
  improvement_area?: string;
  comment?: string | null;
};

const QUESTIONS: Array<{ key: RatingKey; title: string; hint: string }> = [
  { key: "contentRating", title: "เนื้อหาเข้าใจง่ายเพียงใด", hint: "คิดถึงคำอธิบายและลำดับของบทเรียน" },
  { key: "usabilityRating", title: "ขั้นตอนการฝึกใช้งานง่ายเพียงใด", hint: "คิดถึงการกดเลือก อ่านโจทย์ และไปขั้นถัดไป" },
  { key: "confidenceRating", title: "หลังฝึก คุณมั่นใจในการช่วยเหลือมากขึ้นเพียงใด", hint: "ประเมินความมั่นใจของคุณหลังใช้เว็บ" },
  { key: "appRating", title: "โดยรวมพึงพอใจกับน้องพร้อมเพียงใด", hint: "ให้คะแนนประสบการณ์ทั้งหมด" },
];

const IMPROVEMENT_AREAS = [
  ["lessons", "บทเรียน"], ["assessment", "การประเมินเหตุ"], ["call1669", "การโทร 1669"],
  ["cpr", "การฝึก CPR"], ["aed", "การใช้ AED"], ["interface", "หน้าตาและการใช้งาน"],
] as const;

const EMPTY_DRAFT: FeedbackDraft = {
  contentRating: 0, usabilityRating: 0, confidenceRating: 0, appRating: 0, improvementArea: "", comment: "",
};

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <fieldset className="survey-rating">
      <legend className="sr-only">{label}</legend>
      <div role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button key={rating} type="button" role="radio" aria-checked={value === rating} onClick={() => onChange(rating)}>
            <strong>{rating}</strong><span>{rating === 1 ? "น้อยมาก" : rating === 5 ? "มากที่สุด" : ""}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function SatisfactionSurvey({ isLoggedIn, onLogin }: { isLoggedIn: boolean; onLogin: () => void }) {
  const [draft, setDraft] = useState<FeedbackDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [hasSavedAnswer, setHasSavedAnswer] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    if (!isLoggedIn) return;
    const controller = new AbortController();
    fetch("/api/player/feedback", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("load_failed");
        return (await response.json()) as { feedback?: SavedFeedback | null };
      })
      .then(({ feedback }) => {
        if (feedback) {
          setDraft({
            contentRating: feedback.content_rating ?? 0,
            usabilityRating: feedback.usability_rating ?? 0,
            confidenceRating: feedback.confidence_rating ?? 0,
            appRating: feedback.app_rating ?? 0,
            improvementArea: feedback.improvement_area ?? "",
            comment: feedback.comment ?? "",
          });
          setHasSavedAnswer(true);
        } else {
          setDraft(EMPTY_DRAFT);
          setHasSavedAnswer(false);
        }
        setStep(0);
        setStatus("idle");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [isLoggedIn]);

  const currentQuestion = QUESTIONS[step];
  const isFinalStep = step === QUESTIONS.length;
  const setRating = (key: RatingKey, value: number) => setDraft((current) => ({ ...current, [key]: value }));

  async function submit() {
    if (!draft.improvementArea || QUESTIONS.some(({ key }) => !draft[key])) return;
    setStatus("sending");
    try {
      const response = await fetch("/api/player/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft),
      });
      if (!response.ok) throw new Error("submit_failed");
      setHasSavedAnswer(true); setStatus("done");
    } catch { setStatus("error"); }
  }

  return (
    <footer className="satisfaction-survey" aria-labelledby="survey-title">
      {!isLoggedIn ? (
        <div className="survey-login">
          <div><p className="protocol-code">แบบประเมินสั้น ๆ</p><h2 id="survey-title">เข้าสู่ระบบก่อนส่งแบบประเมิน</h2><p className="caption">แบบประเมินเปิดให้ผู้มีโปรไฟล์ผู้เล่น เพื่อป้องกันคำตอบซ้ำ</p></div>
          <button className="secondary-button" type="button" onClick={onLogin}>เข้าสู่ระบบเพื่อประเมิน</button>
        </div>
      ) : status === "done" ? (
        <div className="survey-thanks" role="status">
          <CheckCircle2 aria-hidden="true" />
          <div><h2 id="survey-title">ขอบคุณสำหรับความคิดเห็น</h2><p>คำตอบของคุณช่วยให้เราปรับบทเรียนและการฝึกให้ดีขึ้น</p></div>
          <button className="text-button" type="button" onClick={() => { setStep(0); setStatus("idle"); }}>แก้ไขคำตอบ</button>
        </div>
      ) : (
        <>
          <header className="survey-header">
            <div><p className="protocol-code">แบบประเมินสั้น ๆ</p><h2 id="survey-title">ช่วยเราปรับน้องพร้อม</h2></div>
            <span aria-label={`คำถาม ${step + 1} จาก 5`}>{step + 1} จาก 5</span>
          </header>
          <div className="survey-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>

          {!isFinalStep && currentQuestion ? (
            <section className="survey-question">
              <div><h3>{currentQuestion.title}</h3><p>{currentQuestion.hint}</p></div>
              <RatingRow label={currentQuestion.title} value={draft[currentQuestion.key]} onChange={(value) => setRating(currentQuestion.key, value)} />
            </section>
          ) : (
            <section className="survey-question">
              <div><h3>ส่วนใดควรปรับปรุงมากที่สุด?</h3><p>เลือกหนึ่งส่วนที่อยากให้เราพัฒนาก่อน</p></div>
              <div className="survey-area-options" role="radiogroup" aria-label="ส่วนที่ควรปรับปรุงมากที่สุด">
                {IMPROVEMENT_AREAS.map(([value, label]) => (
                  <button key={value} type="button" role="radio" aria-checked={draft.improvementArea === value} onClick={() => setDraft((current) => ({ ...current, improvementArea: value }))}>{label}</button>
                ))}
              </div>
              <label className="survey-comment"><span>อยากให้ปรับอะไรเพิ่มเติม? <small>ไม่บังคับ</small></span><textarea maxLength={300} value={draft.comment} onChange={(event) => setDraft((current) => ({ ...current, comment: event.target.value }))} placeholder="พิมพ์ความคิดเห็นเพิ่มเติม" /><small>{draft.comment.length}/300</small></label>
            </section>
          )}

          <div className="survey-actions">
            {step > 0 && <button className="text-button" type="button" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={18} /> ย้อนกลับ</button>}
            {!isFinalStep && currentQuestion ? (
              <button className="primary-button" type="button" disabled={!draft[currentQuestion.key]} onClick={() => setStep((current) => current + 1)}>ถัดไป <ArrowRight size={18} /></button>
            ) : (
              <button className="primary-button" type="button" disabled={!draft.improvementArea || status === "sending"} onClick={submit}>{status === "sending" ? "กำลังส่ง…" : hasSavedAnswer ? "บันทึกคำตอบใหม่" : "ส่งแบบประเมิน"}</button>
            )}
          </div>
          {status === "error" && <p className="caption text-[var(--color-error)]" role="alert">โหลดหรือส่งข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง</p>}
        </>
      )}
    </footer>
  );
}
