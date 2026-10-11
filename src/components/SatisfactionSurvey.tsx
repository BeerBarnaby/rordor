"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const FEEDBACK_ID_KEY = "nong_prom_feedback_id_v1";

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <fieldset className="survey-rating">
      <legend>{label}</legend>
      <div role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button key={rating} type="button" role="radio" aria-checked={value === rating} onClick={() => onChange(rating)}>
            <strong>{rating}</strong><span>{rating === 1 ? "น้อย" : rating === 5 ? "มาก" : ""}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function SatisfactionSurvey() {
  const [appRating, setAppRating] = useState(0);
  const [knowledgeRating, setKnowledgeRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit() {
    if (!appRating || !knowledgeRating) return;
    setStatus("sending");
    try {
      let clientId = localStorage.getItem(FEEDBACK_ID_KEY);
      if (!clientId) {
        clientId = crypto.randomUUID();
        localStorage.setItem(FEEDBACK_ID_KEY, clientId);
      }
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, appRating, knowledgeRating }),
      });
      if (!response.ok) throw new Error("submit_failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="satisfaction-survey" aria-labelledby="survey-title">
      {status === "done" ? (
        <div className="survey-thanks" role="status"><CheckCircle2 aria-hidden="true" /><div><h2 id="survey-title">ขอบคุณสำหรับความคิดเห็น</h2><p>คำตอบช่วยให้เราปรับน้องพร้อมให้ใช้งานได้ดีขึ้น</p></div></div>
      ) : (
        <>
          <div><p className="protocol-code">แบบประเมินสั้น ๆ</p><h2 id="survey-title">ประสบการณ์ของคุณเป็นอย่างไร?</h2><p className="caption">ให้คะแนน 1–5 ใช้เวลาไม่ถึง 1 นาที</p></div>
          <RatingRow label="ความพึงพอใจในการใช้แอป" value={appRating} onChange={setAppRating} />
          <RatingRow label="ความรู้ที่ได้รับมีประโยชน์เพียงใด" value={knowledgeRating} onChange={setKnowledgeRating} />
          <button className="secondary-button" type="button" disabled={!appRating || !knowledgeRating || status === "sending"} onClick={submit}>{status === "sending" ? "กำลังส่ง..." : "ส่งแบบประเมิน"}</button>
          {status === "error" && <p className="caption text-[var(--color-error)]" role="alert">ส่งไม่สำเร็จ กรุณาลองอีกครั้ง</p>}
        </>
      )}
    </footer>
  );
}
